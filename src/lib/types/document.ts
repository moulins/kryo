import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { CaseStyle, rename } from "../case-style";
import { IoType, Lazy, Reader, Type, VersionedType, Writer } from "../core";
import { createInvalidDocumentError } from "../errors/invalid-document";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError } from "../errors/not-implemented";
import { readVisitor } from "../readers/read-visitor";

export type Name = "document";
export const name: Name = "document";

export interface Diff<T> {
  set: {[P in keyof T]?: any}; // val
  update: {[P in keyof T]?: any}; // diff
  unset: {[P in keyof T]?: any}; // val
}

export interface DocumentTypeOptions<T> {
  /**
   * Treat values with extra keys as invalid.
   */
  noExtraKeys?: boolean;

  /**
   * A dictionary between a property name and its description.
   */
  properties: {readonly [P in keyof T]: PropertyDescriptor<T[P], Type<T[P]>>};

  /**
   * The keys of the serialized documents are renamed following the
   * supplied style (undefined to keep the original name).
   */
  changeCase?: CaseStyle;

  rename?: {readonly [P in keyof T]?: string};
}

export interface DocumentIoTypeOptions<T> extends DocumentTypeOptions<T> {
  properties: {readonly [P in keyof T]: PropertyDescriptor<T[P], IoType<T[P]>>};
}

export interface PropertyDescriptor<T, K extends Type<T> = Type<T>> {
  /**
   * Allows this property to be missing (undefined values throw errors).
   */
  optional?: boolean;

  /**
   * The type of this property.
   */
  type: K;

  /**
   * The key in the serialized documents will be automatically renamed with the provided
   * case style.
   */
  changeCase?: CaseStyle;

  /**
   * The name of the key used in the serialized documents.
   */
  rename?: string;
}

export interface DocumentTypeConstructor {
  new<T>(options: Lazy<DocumentIoTypeOptions<T>>): DocumentIoType<T>;

  /**
   * Create a new document type checking for objects with the supplied properties.
   *
   * The generic type `T` is the interface described by this instance.
   *
   * @param options Options describing this document type.
   * @return The document type corresponding to the provided options
   */
  new<T>(options: Lazy<DocumentTypeOptions<T>>): DocumentType<T>;
}

export interface DocumentType<T> extends Type<T>, VersionedType<T, Diff<T>>, DocumentTypeOptions<T> {
  getOutKey(key: keyof T): string;
}

// tslint:disable-next-line:max-line-length
export interface DocumentIoType<T> extends IoType<T>, VersionedType<T, Diff<T>>, DocumentIoTypeOptions<T> {
  getOutKey(key: keyof T): string;

  read<R>(reader: Reader<R>, raw: R): T;

  write<W>(writer: Writer<W>, value: T): W;
}

// We use an `any` cast because of the `properties` property.
// tslint:disable-next-line:variable-name
export const DocumentType: DocumentTypeConstructor = <any> class<T> implements IoType<T>,
  DocumentIoTypeOptions<T> {
  readonly name: Name = name;
  readonly noExtraKeys?: boolean;
  readonly properties: {readonly [P in keyof T]: PropertyDescriptor<T[P], any>};
  readonly rename?: {readonly [P in keyof T]?: string};
  readonly changeCase?: CaseStyle;
  private _options: Lazy<DocumentTypeOptions<T>>;
  private _outKeys: Map<string, keyof T> | undefined;

  constructor(options: Lazy<DocumentTypeOptions<T>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.properties = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["noExtraKeys", "properties", "changeCase", "rename" as keyof this]);
    }
  }

  /**
   * Map from serialized keys to the document keys
   */
  get outKeys(): Map<string, keyof T> {
    if (this._outKeys === undefined) {
      this._outKeys = new Map();
      for (const key of Object.keys(this.properties) as (keyof T)[]) {
        this._outKeys.set(this.getOutKey(key), key);
      }
    }
    return this._outKeys;
  }

  getOutKey(key: keyof T): string {
    if (typeof key !== "string") {
      throw new Error(`NonStringKey: ${key}`);
    }
    const descriptor: PropertyDescriptor<any> = this.properties[key];
    if (descriptor.rename !== undefined) {
      return descriptor.rename;
    } else if (descriptor.changeCase !== undefined) {
      return rename(key as string, descriptor.changeCase);
    }
    if (this.rename !== undefined && this.rename[key] !== undefined) {
      return this.rename[key]!;
    } else if (this.changeCase !== undefined) {
      return rename(key as string, this.changeCase);
    }
    return key;
  }

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): T {
    return reader.readDocument(raw, readVisitor({
      fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): T => {
        const extra: Set<string> = new Set();
        const missing: Set<string> = new Set();
        for (const key in this.properties) {
          const descriptor: PropertyDescriptor<any> = this.properties[key];
          if (!descriptor.optional) {
            missing.add(key);
          }
        }
        const invalid: Map<string, Error> = new Map();
        const result: Partial<T> = {}; // Object.create(null);

        for (const [rawKey, rawValue] of input) {
          const outKey: string = keyReader.readString(
            rawKey,
            readVisitor({fromString: (input: string): string  => input}),
          );
          const key: keyof T | undefined = this.outKeys.get(outKey);
          if (key === undefined) {
            // Extra key
            extra.add(outKey);
            continue;
          }
          missing.delete(key as string);
          const descriptor: PropertyDescriptor<any> = this.properties[key];
          // TODO: Update readers so `undefined` is impossible/not handled here
          if (rawValue === undefined) {
            if (descriptor.optional) {
              result[key] = undefined;
            } else {
              missing.add(key as string);
            }
            continue;
          }
          try {
            result[key] = descriptor.type.read!(valueReader, rawValue);
          } catch (err) {
            invalid.set(key as string, err);
          }
        }

        if (this.noExtraKeys && extra.size > 0 || missing.size > 0 || invalid.size > 0) {
          throw createInvalidDocumentError({extra, missing, invalid});
        }
        return result as T;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: T): W {
    const outKeys: Map<string, keyof T> = new Map(this.outKeys);

    for (const [outKey, jskey] of outKeys) {
      if (value[jskey] === undefined) {
        outKeys.delete(outKey);
      }
    }

    return writer.writeDocument(outKeys.keys(), <FW>(outKey: string, fieldWriter: Writer<FW>): FW => {
      const jsKey: keyof T = this.outKeys.get(outKey)!;
      const descriptor: PropertyDescriptor<any> = this.properties[jsKey];
      if (descriptor.type.write === undefined) {
        throw new Incident("NotWritable", {type: descriptor.type});
      }
      return descriptor.type.write(fieldWriter, value[jsKey]);
    });
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "object" || val === null) {
      return createInvalidTypeError("object", val);
    }

    const extra: Set<string> | undefined = this.noExtraKeys ? new Set(Object.keys(val)) : undefined;
    const missing: Set<string> = new Set();
    const invalid: Map<string, Error> = new Map();

    for (const key in this.properties) {
      if (extra !== undefined) {
        extra.delete(key);
      }
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      const propertyValue: any = val[key];
      if (propertyValue === undefined) {
        if (!descriptor.optional) {
          missing.add(key);
        }
        continue;
      }
      const error: Error | undefined = descriptor.type.testError!(propertyValue);
      if (error !== undefined) {
        invalid.set(key as string, error);
      }
    }

    if (extra !== undefined && extra.size > 0 || missing.size > 0 || invalid.size > 0) {
      return createInvalidDocumentError({extra, missing, invalid});
    }
    return undefined;
  }

  test(val: T): val is T {
    if (typeof val !== "object" || val === null) {
      return false;
    }

    const extra: Set<string> | undefined = this.noExtraKeys ? new Set(Object.keys(val)) : undefined;

    for (const key in this.properties) {
      if (extra !== undefined) {
        extra.delete(key);
      }
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      const propertyValue: any = val[key];
      if (propertyValue === undefined) {
        if (!descriptor.optional) {
          return false;
        }
      } else if (!descriptor.type.test(propertyValue)) {
        return false;
      }
    }

    return extra === undefined || extra.size === 0;
  }

  equals(val1: T, val2: T): boolean {
    for (const key in this.properties) {
      const descriptor: PropertyDescriptor<any> = this.properties[key];
      if (!descriptor.optional) {
        if (!descriptor.type.equals(val1[key], val2[key])) {
          return false;
        }
        continue;
      }
      if (val1[key] === undefined && val2[key] === undefined) {
        continue;
      }
      if (val1[key] === undefined || val2[key] === undefined || !descriptor.type.equals(val1[key], val2[key])) {
        return false;
      }
    }
    return true;
  }

  clone(val: T): T {
    const result: Partial<T> = {}; // Object.create(null);
    for (const key in this.properties) {
      result[key] = val[key] === undefined ? undefined : this.properties[key].type.clone(val[key]);
    }
    return result as T;
  }

  diff(oldVal: T, newVal: T): Diff<T> | undefined {
    let equal: boolean = true;
    const result: Diff<T> = {set: {}, unset: {}, update: {}};
    for (const key in this.properties) {
      // TODO: Remove cast
      const descriptor: PropertyDescriptor<any, VersionedType<any, any>> = <any> this.properties[key];
      const oldMember: any = (<any> oldVal)[key];
      const newMember: any = (<any> newVal)[key];
      if (oldMember !== undefined) {
        if (newMember !== undefined) {
          const diff: any = descriptor.type.diff(oldMember, newMember);
          if (diff !== undefined) {
            result.update[key] = diff;
            equal = false;
          }
        } else {
          result.unset[key] = descriptor.type.clone(oldMember);
          equal = false;
        }
      } else {
        if (newMember === undefined) {
          result.set[key] = descriptor.type.clone(newMember);
          equal = false;
        }
      }
    }
    return equal ? undefined : result;
  }

  patch(oldVal: T, diff: Diff<T> | undefined): T {
    const result: T = this.clone(oldVal);
    if (diff === undefined) {
      return result;
    }
    for (const key in diff.set) {
      result[key] = this.properties[key].type.clone(diff.set[key]);
    }
    for (const key in diff.unset) {
      Reflect.deleteProperty(result as any as object, key);
    }
    for (const key in diff.update) {
      // TODO: Remove cast
      result[key] = (this.properties[key].type as any).patch(result[key], diff.update[key]);
    }
    return result;
  }

  reverseDiff(diff: Diff<T> | undefined): Diff<T> | undefined {
    if (diff === undefined) {
      return undefined;
    }
    const result: Diff<T> = {set: {}, unset: {}, update: {}};
    for (const key in diff.unset) {
      result.set[key] = this.properties[key].type.clone(diff.unset[key]);
    }
    for (const key in diff.set) {
      result.unset[key] = this.properties[key].type.clone(diff.set[key]);
    }
    for (const key in diff.update) {
      // TODO: Remove cast
      result.update[key] = (this.properties[key].type as any).reverseDiff(diff.update[key]);
    }
    return result;
  }

  squash(_diff1: Diff<T> | undefined, _diff2: Diff<T> | undefined): Diff<T> | undefined {
    throw createNotImplementedError("DocumentType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: DocumentTypeOptions<T> = typeof this._options === "function" ?
      this._options() :
      this._options;

    const noExtraKeys: boolean | undefined = options.noExtraKeys;
    const properties: {[P in keyof T]: PropertyDescriptor<any>} = options.properties;
    const rename: {[P in keyof T]?: string} | undefined = options.rename;
    const changeCase: CaseStyle | undefined = options.changeCase;

    Object.assign(this, {noExtraKeys, properties, rename, changeCase});
  }
};

export function renameKeys<T>(obj: T, renameAll?: CaseStyle): Map<keyof T, string> {
  const keys: string[] = Object.keys(obj);
  const result: Map<keyof T, string> = new Map();
  const outKeys: Set<string> = new Set();
  for (const key of keys) {
    const renamed: string = renameAll === undefined ? key : rename(key, renameAll);
    result.set(key as keyof T, renamed);
    if (outKeys.has(renamed)) {
      throw new Incident("NonBijectiveKeyRename", "Some keys are the same after renaming");
    }
    outKeys.add(renamed);
  }
  return result;
}
