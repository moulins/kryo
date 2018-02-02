import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidArrayItemsError } from "../errors/invalid-array-items";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createMaxArrayLengthError } from "../errors/max-array-length";
import { createNotImplementedError } from "../errors/not-implemented";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Lazy, Readable, Reader, Type, Writable, Writer } from "../types";
import { LiteralTypeOptions } from "./literal";

export type Name = "array";
export const name: Name = "array";
export namespace json {
  // TODO(demurgos): Export arrayType to JSON
  export type Type = undefined;
}
export type Diff = any;

/**
 * T: Item type
 * M: Meta-Type
 */
export interface ArrayTypeOptions<T, M extends Type<T> = Type<T>> {
  itemType: M;
  maxLength: number;
}

export interface ArrayTypeConstructor {
  /**
   * Create a new array type
   */
  new<T>(options: Lazy<ArrayTypeOptions<T>>): ArrayType<T>;

  new<T>(options: Lazy<LiteralTypeOptions<T, Readable<T> & Type<T>>>): ArrayType<T> & Readable<T>;

  new<T>(options: Lazy<LiteralTypeOptions<T, Writable<T> & Type<T>>>): ArrayType<T> & Writable<T>;

  new<T>(options: Lazy<LiteralTypeOptions<T, IoType<T>>>): ArrayIoType<T>;
}

export interface ArrayType<T, M extends Type<T> = Type<T>> extends Type<T[]>, ArrayTypeOptions<T, M> {
}

export interface ArrayIoType<T, M extends IoType<T> = IoType<T>> extends IoType<T[]>,
  ArrayTypeOptions<T, M> {
}

// tslint:disable-next-line:variable-name
export const ArrayType: ArrayTypeConstructor = <any> class<T, M extends Type<T> = Type<T>> {
  readonly name: Name = name;
  readonly itemType: M;
  readonly maxLength: number;

  private _options: Lazy<ArrayTypeOptions<T, M>>;

  constructor(options: Lazy<ArrayTypeOptions<T, M>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.itemType = <any> undefined;
    this.maxLength = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["itemType", "maxLength"]);
    }
  }

  toJSON(): json.Type {
    throw createNotImplementedError("ArrayType#toJSON");
  }

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): T[] {
    const itemType: M = this.itemType;
    const maxLength: number | undefined = this.maxLength;

    return reader.readList(raw, readVisitor({
      fromList<RI>(input: Iterable<RI>, itemReader: Reader<RI>): T[] {
        let invalid: undefined | Map<number, Error> = undefined;
        const result: T[] = [];
        let i: number = 0;
        for (const rawItem of input) {
          if (maxLength !== undefined && i === maxLength) {
            throw createMaxArrayLengthError([...input], maxLength);
          }
          try {
            const item: T = itemType.read!(itemReader, rawItem);
            if (invalid === undefined) {
              result.push(item);
            }
          } catch (err) {
            if (invalid === undefined) {
              invalid = new Map();
            }
            invalid.set(i, err);
          }
          i++;
        }
        if (invalid !== undefined) {
          throw createInvalidArrayItemsError(invalid);
        }
        return result;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: T[]): W {
    return writer.writeList(value.length, <IW>(index: number, itemWriter: Writer<IW>): IW => {
      if (this.itemType.write === undefined) {
        throw new Incident("NotWritable", {type: this.itemType});
      }
      return this.itemType.write(itemWriter, value[index]);
    });
  }

  testError(val: T[]): Error | undefined {
    if (!Array.isArray(val)) {
      return createInvalidTypeError("array", val);
    }
    if (this.maxLength !== undefined && val.length > this.maxLength) {
      return createMaxArrayLengthError(val, this.maxLength);
    }
    const invalid: Map<number, Error> = new Map();
    const itemCount: number = val.length;
    for (let i: number = 0; i < itemCount; i++) {
      const error: Error | undefined = this.itemType.testError(val[i]);
      if (error !== undefined) {
        invalid.set(i, error);
      }
    }
    if (invalid.size !== 0) {
      return createInvalidArrayItemsError(invalid);
    }
    return undefined;
  }

  test(val: T[]): val is T[] {
    if (!Array.isArray(val) || (this.maxLength !== undefined && val.length > this.maxLength)) {
      return false;
    }
    for (const item of val) {
      if (!this.itemType.test(item)) {
        return false;
      }
    }
    return true;
  }

  equals(val1: T[], val2: T[]): boolean {
    if (val2.length !== val1.length) {
      return false;
    }
    for (let i: number = 0; i < val1.length; i++) {
      if (!this.itemType.equals(val2[i], val1[i])) {
        return false;
      }
    }
    return true;
  }

  clone(val: T[]): T[] {
    return val.map((item: T): T => this.itemType.clone(item));
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: ArrayTypeOptions<T, M> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: M = options.itemType;
    const maxLength: number = options.maxLength;

    Object.assign(this, {itemType, maxLength});
  }
};
