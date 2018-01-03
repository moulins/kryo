import { Incident } from "incident";
import { ExtraKeysError } from "./_errors/extra-keys";
import { InvalidPropertyError } from "./_errors/invalid-property";
import { MissingKeysError } from "./_errors/missing-keys";
import { NotImplementedError } from "./_errors/not-implemented";
import { NullPropertyError } from "./_errors/null-property";
import { WrongTypeError } from "./_errors/wrong-type";
import { lazyProperties } from "./_helpers/lazy-properties";
import { CaseStyle, rename } from "./_helpers/rename";
import { BsonSerializer, Lazy, QsSerializer, Type as KryoType, VersionedType } from "./types";

export type Name = "document";
export const name: Name = "document";
export namespace bson {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }
}
export namespace json {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }

  export interface Type {
    name: Name;
    notNan: boolean;
    notInfinity: boolean;
  }
}
export namespace qs {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }
}

export interface Diff {
  set: {[key: string]: any}; // val
  update: {[key: string]: any}; // diff
  unset: {[key: string]: any}; // val
}

export interface Options<TypeKind extends KryoType<any>> {
  /**
   * Do not throw error when the object contains extraneous keys.
   */
  ignoreExtraKeys?: boolean;

  /**
   * A dictionary between a property name and its description.
   */
  properties: {[key: string]: PropertyDescriptor<TypeKind>};

  /**
   * The keys of the serialized documents are renamed following the
   * supplied style (undefined to keep the original name).
   */
  rename?: CaseStyle;
}

export interface PropertyDescriptor<TypeKind extends KryoType<any>> {
  /**
   * Allows this property to be missing (undefined values throw errors).
   */
  optional?: boolean;

  /**
   * The type of this property.
   */
  type: TypeKind;
}

export interface DiffSetsResult<T> {
  commonKeys: Set<T>;
  missingKeys: Set<T>;
  extraKeys: Set<T>;
}

function diffSets<T>(reference: Iterable<T>, values: Iterable<T>): DiffSetsResult<T> {
  const referenceSet: Set<T> = new Set<T>(reference);
  const valuesSet: Set<T> = new Set<T>(values);
  const all: Set<T> = new Set<T>([...referenceSet, ...valuesSet]);
  const commonKeys: Set<T> = new Set<T>();
  const missingKeys: Set<T> = new Set<T>();
  const extraKeys: Set<T> = new Set<T>();

  for (const key of all) {
    if (!valuesSet.has(key)) {
      missingKeys.add(key);
    } else if (!referenceSet.has(key)) {
      extraKeys.add(key);
    } else {
      commonKeys.add(key);
    }
  }

  return {commonKeys, missingKeys, extraKeys};
}

export class DocumentType<T extends {}>
  implements VersionedType<T, json.Input, json.Output, Diff>,
    BsonSerializer<T, bson.Input, bson.Output>,
    QsSerializer<T, qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly ignoreExtraKeys: boolean;
  readonly properties: {
    [key: string]: PropertyDescriptor<VersionedType<any, any, any, any>>;
  };
  readonly rename?: CaseStyle;

  /**
   * Map from the document keys to the serialized names
   */
  private readonly keys: Map<string, string>;

  /**
   * Map from the serialized names to the document keys
   */
  private readonly outKeys: Map<string, string>;

  private _options: Lazy<Options<VersionedType<any, any, any, any>>>;

  constructor(options: Lazy<Options<VersionedType<any, any, any, any>>>, lazy?: boolean) {
    this._options = options;
    if (lazy === undefined) {
      lazy = typeof options === "function";
    }
    if (!lazy) {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["ignoreExtraKeys", "properties", "rename", "keys", "outKeys"],
      );
    }
  }

  static fromJSON(options: json.Type): DocumentType<{}> {
    throw NotImplementedError.create("DocumentType.fromJSON");
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("DocumentType#toJSON");
  }

  readTrustedJson(input: json.Output): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(this.outKeys.keys(), Object.keys(input));
    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = this.outKeys.get(outKey)!;
      result[key] = this.properties[key].type.readJson(input[outKey]);
    }
    return result as T;
  }

  readTrustedBson(input: bson.Output): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(this.outKeys.keys(), Object.keys(input));
    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = this.outKeys.get(outKey)!;
      // TODO(demurgos): Avoid casting
      result[key] = (<any> this.properties[key].type as BsonSerializer<any>).readBson(input[outKey]);
    }
    return result as T;
  }

  readTrustedQs(input: qs.Output): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(this.outKeys.keys(), Object.keys(input));
    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = this.outKeys.get(outKey)!;
      // TODO(demurgos): Avoid casting
      result[key] = (<any> this.properties[key].type as QsSerializer<any>).readQs(input[outKey]);
    }
    return result as T;
  }

  readJson(input: any): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(this.outKeys.keys(), Object.keys(input));
    const missingRequiredKeys: string[] = [...outKeysDiff.missingKeys].filter((outKey: string): boolean => {
      return !this.properties[this.outKeys.get(outKey)!].optional;
    });
    if (missingRequiredKeys.length > 0) {
      throw MissingKeysError.create(missingRequiredKeys);
    } else if (outKeysDiff.extraKeys.size > 0 && !this.ignoreExtraKeys) {
      throw ExtraKeysError.create([...outKeysDiff.extraKeys]);
    }

    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = this.outKeys.get(outKey)!;
      // TODO(demurgos): Check if the format is supported instead of casting to `any`
      result[key] = this.properties[key].type.readJson(input[outKey]);
    }
    return result as T;
  }

  readBson(input: any): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(this.outKeys.keys(), Object.keys(input));
    const missingRequiredKeys: string[] = [...outKeysDiff.missingKeys].filter((outKey: string): boolean => {
      return !this.properties[this.outKeys.get(outKey)!].optional;
    });
    if (missingRequiredKeys.length > 0) {
      throw MissingKeysError.create(missingRequiredKeys);
    } else if (outKeysDiff.extraKeys.size > 0 && !this.ignoreExtraKeys) {
      throw ExtraKeysError.create([...outKeysDiff.extraKeys]);
    }

    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = this.outKeys.get(outKey)!;
      // TODO(demurgos): Avoid casting
      result[key] = (<any> this.properties[key].type as BsonSerializer<any>).readBson(input[outKey]);
    }
    return result as T;
  }

  readQs(input: any): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(this.outKeys.keys(), Object.keys(input));
    const missingRequiredKeys: string[] = [...outKeysDiff.missingKeys].filter((outKey: string): boolean => {
      return !this.properties[this.outKeys.get(outKey)!].optional;
    });
    if (missingRequiredKeys.length > 0) {
      throw MissingKeysError.create(missingRequiredKeys);
    } else if (outKeysDiff.extraKeys.size > 0 && !this.ignoreExtraKeys) {
      throw ExtraKeysError.create([...outKeysDiff.extraKeys]);
    }

    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = this.outKeys.get(outKey)!;
      // TODO(demurgos): Avoid casting
      result[key] = (<any> this.properties[key].type as QsSerializer<any>).readQs(input[outKey]);
    }
    return result as T;
  }

  writeJson(val: T): json.Output {
    const keysDiff: DiffSetsResult<string> = diffSets(this.keys.keys(), Object.keys(val));
    const result: {[key: string]: any} = {};
    for (const key of keysDiff.commonKeys) {
      if ((<any> val)[key] === undefined && this.properties[key].optional) {
        continue;
      }
      const outKey: string = this.keys.get(key)!;
      result[outKey] = this.properties[key].type.writeJson((<any> val)[key]);
    }
    return result;
  }

  writeBson(val: T): bson.Output {
    const keysDiff: DiffSetsResult<string> = diffSets(this.keys.keys(), Object.keys(val));
    const result: {[key: string]: any} = {};
    for (const key of keysDiff.commonKeys) {
      if ((<any> val)[key] === undefined && this.properties[key].optional) {
        continue;
      }
      const outKey: string = this.keys.get(key)!;
      // TODO(demurgos): Avoid casting
      result[outKey] = (<any> this.properties[key].type as BsonSerializer<any>).writeBson((<any> val)[key]);
    }
    return result;
  }

  writeQs(val: T): qs.Output {
    const keysDiff: DiffSetsResult<string> = diffSets(this.keys.keys(), Object.keys(val));
    const result: {[key: string]: any} = {};
    for (const key of keysDiff.commonKeys) {
      if ((<any> val)[key] === undefined && this.properties[key].optional) {
        continue;
      }
      const outKey: string = this.keys.get(key)!;
      // TODO(demurgos): Avoid casting
      result[outKey] = (<any> this.properties[key].type as QsSerializer<any>).writeQs((<any> val)[key]);
    }
    return result;
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "object" || val === null) {
      return WrongTypeError.create("object", val);
    }
    const keysDiff: DiffSetsResult<string> = diffSets(this.keys.keys(), Object.keys(val));
    const missingRequiredKeys: string[] = [...keysDiff.missingKeys].filter((key: string): boolean => {
      return !this.properties[key].optional;
    });
    if (missingRequiredKeys.length > 0) {
      return MissingKeysError.create(missingRequiredKeys);
    } else if (keysDiff.extraKeys.size > 0 && !this.ignoreExtraKeys) {
      return ExtraKeysError.create([...keysDiff.extraKeys]);
    }

    for (const key of keysDiff.commonKeys) {
      const member: any = (<any> val)[key];
      const descriptor: PropertyDescriptor<KryoType<any>> = this.properties[key];
      if (member === undefined) {
        if (descriptor.optional) {
          continue;
        } else {
          return NullPropertyError.create(key);
        }
      }
      const error: Error | undefined = descriptor.type.testError(member);
      if (error !== undefined) {
        return InvalidPropertyError.create(key, member);
      }
    }
    return undefined;
  }

  test(val: T): val is T {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    for (const key in this.properties) {
      const descriptor: PropertyDescriptor<KryoType<any>> = this.properties[key];
      const member1: any = (<any> val1)[key];
      const member2: any = (<any> val2)[key];
      if (!descriptor.optional) {
        if (!descriptor.type.equals(member1, member2)) {
          return false;
        }
      } else {
        if (val1.hasOwnProperty(key) && val2.hasOwnProperty(key)) {
          if (!descriptor.type.equals(member1, member2)) {
            return false;
          }
        } else if (!(member1 === undefined && member2 === undefined)) {
          return false;
        }
      }
    }
    return true;
  }

  clone(val: T): T {
    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const key in this.properties) {
      const member: any = (<any> val)[key];
      if (member !== undefined) {
        result[key] = this.properties[key].type.clone(member);
      }
    }
    return result as T;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    let equal: boolean = true;
    const result: Diff = {set: {}, unset: {}, update: {}};
    for (const key in this.properties) {
      const descriptor: PropertyDescriptor<VersionedType<any, any, any, any>> = this.properties[key];
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

  patch(oldVal: T, diff: Diff | undefined): T {
    const result: T = this.clone(oldVal);
    if (diff === undefined) {
      return result;
    }
    for (const key in diff.set) {
      (<any> result)[key] = this.properties[key].type.clone(diff.set[key]);
    }
    for (const key in diff.unset) {
      delete (<any> result)[key];
    }
    for (const key in diff.update) {
      (<any> result)[key] = this.properties[key].type.patch((<any> result)[key][key], diff.update[key]);
    }
    return result;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    if (diff === undefined) {
      return undefined;
    }
    const result: Diff = {
      set: {},
      unset: {},
      update: {},
    };
    for (const key in diff.unset) {
      result.set[key] = this.properties[key].type.clone(diff.unset[key]);
    }
    for (const key in diff.set) {
      result.unset[key] = this.properties[key].type.clone(diff.set[key]);
    }
    for (const key in diff.update) {
      result.update[key] = this.properties[key].type.reverseDiff(diff.update[key]);
    }
    return result;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("DocumentType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options<VersionedType<any, any, any, any>> = typeof this._options === "function" ?
      this._options() :
      this._options;

    const ignoreExtraKeys: boolean = options.ignoreExtraKeys || false;
    const properties: {[key: string]: PropertyDescriptor<VersionedType<any, any, any, any>>} = options.properties;
    const renameAll: CaseStyle | undefined = options.rename;
    const keys: Map<string, string> = new Map<string, string>();
    const outKeys: Map<string, string> = new Map<string, string>();

    for (const key in properties) {
      const renamed: string = renameAll === undefined ? key : rename(key, renameAll);
      keys.set(key, renamed);
      if (outKeys.has(renamed)) {
        throw new Incident("NonBijectiveKeyRename", "Some keys are the same after renaming");
      }
      outKeys.set(renamed, key);
    }

    Object.assign(this, {ignoreExtraKeys, properties, rename: renameAll, keys, outKeys});
    Object.freeze(this);
  }
}

export { DocumentType as Type };
