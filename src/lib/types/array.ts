import {InvalidArrayItemError} from "../errors/invalid-array-item";
import {MaxArrayLengthError} from "../errors/max-array-length";
import {NotImplementedError} from "../errors/not-implemented";
import {WrongTypeError} from "../errors/wrong-type";
import {VersionedType} from "../interfaces";

export type Name = "array";
export const name: Name = "array";
/* tslint:disable-next-line:no-namespace */
export namespace json {
  export type Type = undefined;
}
export type Diff = any;

export interface Options {
  maxLength: number;
}
export const defaultOptions: Options = {
  maxLength: Infinity
};

export class ArrayType<T, Output, Input extends Output, Diff> implements VersionedType<T[], Output[], Input[], Diff> {
  readonly name: Name = name;
  readonly itemType: VersionedType<T, Output, Input, Diff>;
  readonly options: Options;

  constructor(itemType: VersionedType<T, Output, Input, Diff>, options: Options) {
    this.itemType = itemType;
    this.options = {...defaultOptions, ...options};
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("ArrayType#toJSON");
  }

  readTrusted(format: "json", val: Output[]): T[] {
    return val.map((item: Output): T => this.itemType.readTrusted(format, item));
  }

  read(format: "json", val: any): T[] {
    if (!Array.isArray(val)) {
      throw WrongTypeError.create("array", val);
    }
    const result: T[] = val.map((item: Output): T => this.itemType.readTrusted(format, item));
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  write(format: "json", val: T[]): Output[] {
    return val.map((item: T): Output => this.itemType.write(format, item));
  }

  testError(val: T[]): Error | undefined {
    if (!Array.isArray(val)) {
      return WrongTypeError.create("array", val);
    }
    if (this.options.maxLength !== undefined && val.length > this.options.maxLength) {
      return MaxArrayLengthError.create(val, this.options.maxLength);
    }
    for (let i: number = 0; i < val.length; i++) {
      const error: Error | undefined = this.itemType.testError(val[i]);
      if (error !== undefined) {
        return InvalidArrayItemError.create(i, val[i]);
      }
    }
    return undefined;
  }

  test(val: T[]): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T[], val2: T[]): boolean {
    if (val2.length !== val1.length) {
      return false;
    }
    for (let i: number = 0; i < val1.length; i++) {
      if (val2[i] !== val1[i]) {
        return false;
      }
    }
    return true;
  }

  clone(val: T[]): T[] {
    return val.map((item: T): T => this.itemType.clone(item));
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: T[], newVal: T[]): Diff | undefined {
    throw NotImplementedError.create("ArrayType#diff");
  }

  patch(oldVal: T[], diff: Diff | undefined): T[] {
    throw NotImplementedError.create("ArrayType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("ArrayType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("ArrayType#squash");
  }
}

export {ArrayType as Type};
