import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidFloat64Error } from "../errors/invalid-float64";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Lazy, Reader, VersionedType, Writer } from "../types";

export type Name = "float64";
export const name: Name = "float64";
export namespace json {
  export interface Type {
    readonly name: Name;
    readonly allowNaN: boolean;
    readonly allowInfinity: boolean;
  }
}

/**
 * Options for the `Float64` meta-type.
 */
export interface Float64TypeOptions {
  /**
   * Accept `NaN` values.
   * If you enable this option, the `test` method will treat two `NaN` values as equal.
   *
   * @default `false`
   */
  readonly allowNaN?: boolean;

  /**
   * Accept `+Infinity` and `-Infinity`.
   *
   * @default `false`
   */
  readonly allowInfinity?: boolean;

  // TODO: Add `unifyZeros` (defaults to `true`) to handle `+0` and `-0`
}

// tslint:disable:max-line-length
export class Float64Type implements IoType<number>, VersionedType<number, [number, number]> {
  readonly name: Name = name;
  readonly allowNaN: boolean;
  readonly allowInfinity: boolean;

  private _options: Lazy<Float64TypeOptions>;

  constructor(options?: Lazy<Float64TypeOptions>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.allowNaN = <any> undefined;
    this.allowInfinity = <any> undefined;

    this._options = options !== undefined ? options : {};
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["allowNaN", "allowInfinity"]);
    }
  }

  static fromJSON(options: json.Type): Float64Type {
    return new Float64Type(options);
  }

  toJSON(): json.Type {
    return {
      name,
      allowNaN: this.allowNaN,
      allowInfinity: this.allowInfinity,
    };
  }

  read<R>(reader: Reader<R>, raw: R): number {
    return reader.readFloat64(raw, readVisitor({
      fromFloat64: (input: number): number => {
        const error: Error | undefined = reader.trustInput ? undefined : this.testError(input);
        if (error !== undefined) {
          throw error;
        }
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: number): W {
    return writer.writeFloat64(value);
  }

  testError(val: number): Error | undefined {
    if (typeof val !== "number") {
      return createInvalidTypeError("number", val);
    }
    if (isNaN(val) && !this.allowNaN) {
      return createInvalidFloat64Error(val);
    } else if (Math.abs(val) === Infinity && !this.allowInfinity) {
      return createInvalidFloat64Error(val);
    }
    return undefined;
  }

  test(val: number): boolean {
    return typeof val === "number" && (this.allowNaN || !isNaN(val)) && (this.allowInfinity || Math.abs(val) !== Infinity);
  }

  equals(val1: number, val2: number): boolean {
    if (isNaN(val1) || isNaN(val2)) {
      return isNaN(val1) && isNaN(val2);
    }
    return val1 === val2;
  }

  clone(val: number): number {
    return val;
  }

  diff(oldVal: number, newVal: number): [number, number] | undefined {
    // We can't use an arithmetic difference due to possible precision loss
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: number, diff: [number, number] | undefined): number {
    return diff === undefined ? oldVal : diff[1];
  }

  reverseDiff(diff: [number, number] | undefined): [number, number] | undefined {
    return diff === undefined ? undefined : [diff[1], diff[0]];
  }

  squash(diff1: [number, number] | undefined, diff2: [number, number] | undefined): [number, number] | undefined {
    if (diff1 === undefined) {
      return diff2 === undefined ? undefined : [diff2[0], diff2[1]];
    } else if (diff2 === undefined) {
      return [diff1[0], diff1[1]];
    }
    return this.equals(diff1[0], diff2[1]) ? undefined : [diff1[0], diff2[1]];
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: Float64TypeOptions = typeof this._options === "function" ? this._options() : this._options;
    const allowNaN: boolean = options.allowNaN !== undefined ? options.allowNaN : false;
    const allowInfinity: boolean = options.allowInfinity !== undefined ? options.allowInfinity : false;

    Object.assign(this, {allowNaN, allowInfinity});
  }
}
