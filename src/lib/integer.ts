import {Incident} from "incident";
import {InvalidIntegerError} from "./_errors/invalid-integer";
import {UnknownFormatError} from "./_errors/unknown-format";
import {WrongTypeError} from "./_errors/wrong-type";
import {lazyProperties} from "./_helpers/lazy-properties";
import {Lazy, SerializableType, VersionedType} from "./_interfaces";

export type Name = "int";
export const name: Name = "int";
export type T = number;
export namespace bson {
  export type Input = number;
  export type Output = number;
}
export namespace json {
  export type Input = number;
  export type Output = number;
  export interface Type {
    name: Name;
    min: number;
    max: number;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = number;

/**
 * Options for the `int` type.
 */
export interface Options {
  /**
   * Inclusive minimum value.
   */
  min?: number;

  /**
   * Inclusive maximum value.
   */
  max?: number;
}

/**
 * Default value for the `min` option.
 * It corresponds to `-(2**53)`.
 */
export const DEFAULT_MIN: number = Number.MIN_SAFE_INTEGER - 1;

/**
 * Default value for the `max` option.
 * It corresponds to `2**53 - 1`.
 */
export const DEFAULT_MAX: number = Number.MAX_SAFE_INTEGER;

export class IntegerType
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {

  readonly name: Name = name;
  readonly min: number;
  readonly max: number;

  private _options: Lazy<Options>;

  constructor(options?: Lazy<Options>, lazy?: boolean) {
    if (options === undefined) {
      this._options = {};
      this._applyOptions();
      return;
    }
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
        ["min", "max"],
      );
    }
  }

  static fromJSON(options: json.Type): IntegerType {
    return new IntegerType(options);
  }

  toJSON(): json.Type {
    return {name: name, min: this.min, max: this.max};
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
        return input;
      case "json":
        return input;
      case "qs":
        return parseInt(input, 10);
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    let val: number;
    switch (format) {
      case "bson":
      case "json":
        if (typeof input !== "number") {
          throw WrongTypeError.create("number", input);
        }
        val = input;
        break;
      case "qs":
        if (typeof input !== "string") {
          throw WrongTypeError.create("string", input);
        }
        val = parseInt(input, 10);
        break;
      default:
        throw UnknownFormatError.create(format);
    }
    const err: Error | undefined = this.testError(val);
    if (err !== undefined) {
      throw err;
    }

    return val;
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    switch (format) {
      case "bson":
        return val;
      case "json":
        return val;
      case "qs":
        return val.toString(10);
      default:
        return undefined as never;
    }
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    if (Math.round(val) !== val) {
      return InvalidIntegerError.create(val);
    }
    if (val < this.min || val > this.max) {
      return new Incident("Range", {value: val, min: this.min, max: this.max}, "Integer not in range");
    }
    return undefined;
  }

  test(val: T): boolean {
    return typeof val === "number" && val >= this.min && val <= this.max && Math.round(val) === val;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return newVal === oldVal ? undefined : newVal - oldVal;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return diff === undefined ? oldVal : oldVal + diff as T;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return diff && -diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2;
    } else if (diff2 === undefined) {
      return diff1;
    }
    return diff2 === -diff1 ? undefined : diff1 + diff2;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options = typeof this._options === "function" ? this._options() : this._options;

    const min: number = options.min !== undefined ? options.min : DEFAULT_MIN;
    const max: number = options.max !== undefined ? options.max : DEFAULT_MAX;

    Object.assign(this, {min, max});
    Object.freeze(this);
  }
}

export {IntegerType as Type};
