import { Incident } from "incident";
import { InvalidIntegerError } from "./_errors/invalid-integer";
import { WrongTypeError } from "./_errors/wrong-type";
import { lazyProperties } from "./_helpers/lazy-properties";
import { Lazy, VersionedType } from "./types";

export type Name = "integer";
export const name: Name = "integer";
export type T = number;
export namespace json {
  export type Input = number;
  export type Output = number;

  export interface Type {
    name: Name;
    min: number;
    max: number;
  }
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

export class IntegerType implements VersionedType<T, json.Input, json.Output, Diff> {

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
    return {name, min: this.min, max: this.max};
  }

  readTrustedJson(input: json.Output): T {
    return input;
  }

  readJson(input: any): T {
    let val: number;
    if (typeof input !== "number") {
      throw WrongTypeError.create("number", input);
    }
    val = input;
    const err: Error | undefined = this.testError(val);
    if (err !== undefined) {
      throw err;
    }

    return val;
  }

  writeJson(val: T): json.Output {
    return val;
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

export { IntegerType as Type };
