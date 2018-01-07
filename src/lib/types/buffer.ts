import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { MaxArrayLengthError } from "../errors/max-array-length";
import { NotImplementedError } from "../errors/not-implemented";
import { WrongTypeError } from "../errors/wrong-type";
import { Lazy, VersionedType } from "../types";

export type Name = "buffer";
export const name: Name = "buffer";
export namespace json {
  export type Input = string;
  export type Output = string;
  // TODO(demurgos): Export bufferType to JSON
  export type Type = undefined;
}
export type Diff = any;

export interface Options {
  maxLength: number;
}

export class BufferType implements VersionedType<Uint8Array, json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly maxLength: number;

  private _options: Lazy<Options>;

  constructor(options: Lazy<Options>, lazy?: boolean) {
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
        ["maxLength"],
      );
    }
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("BufferType#toJSON");
  }

  readTrustedJson(input: json.Output): Uint8Array {
    const len: number = input.length / 2;
    const result: Uint8Array = new Uint8Array(len);
    for (let i: number = 0; i < len; i++) {
      result[i] = parseInt(input.substr(2 * i, 2), 16);
    }
    return result;
  }

  readJson(input: any): Uint8Array {
    let result: Uint8Array;
    if (typeof input !== "string") {
      throw WrongTypeError.create("string", input);
    } else if (!/^(?:[0-9a-f]{2})*$/.test(input)) {
      throw WrongTypeError.create("lowerCaseHexEvenLengthString", input);
    }
    const len: number = input.length / 2;
    result = new Uint8Array(len);
    for (let i: number = 0; i < len; i++) {
      result[i] = parseInt(input.substr(2 * i, 2), 16);
    }
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  writeJson(val: Uint8Array): json.Output {
    const result: string[] = new Array(val.length);
    const len: number = val.length;
    for (let i: number = 0; i < len; i++) {
      result[i] = (val[i] < 16 ? "0" : "") + val[i].toString(16);
    }
    return result.join("");
  }

  testError(val: Uint8Array): Error | undefined {
    if (!(val instanceof Uint8Array)) {
      return WrongTypeError.create("Uint8Array", val);
    }
    if (this.maxLength !== undefined && val.length > this.maxLength) {
      return MaxArrayLengthError.create(val, this.maxLength);
    }
    return undefined;
  }

  test(val: Uint8Array): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: Uint8Array, val2: Uint8Array): boolean {
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

  clone(val: Uint8Array): Uint8Array {
    return Uint8Array.from(val);
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: Uint8Array, newVal: Uint8Array): Diff | undefined {
    throw NotImplementedError.create("BufferType#diff");
  }

  patch(oldVal: Uint8Array, diff: Diff | undefined): Uint8Array {
    throw NotImplementedError.create("BufferType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("BufferType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("BufferType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options = typeof this._options === "function" ? this._options() : this._options;

    const maxLength: number = options.maxLength;

    Object.assign(this, {maxLength});
    Object.freeze(this);
  }
}
