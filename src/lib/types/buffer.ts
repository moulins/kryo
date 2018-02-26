import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createMaxArrayLengthError } from "../errors/max-array-length";
import { createNotImplementedError } from "../errors/not-implemented";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Lazy, Reader, VersionedType, Writer } from "../types";

export type Name = "buffer";
export const name: Name = "buffer";
export type Diff = any;

export interface BufferTypeOptions {
  maxLength: number;
}

export class BufferType implements IoType<Uint8Array>, VersionedType<Uint8Array, Diff> {
  readonly name: Name = name;
  readonly maxLength: number;

  private _options: Lazy<BufferTypeOptions>;

  constructor(options: Lazy<BufferTypeOptions>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.maxLength = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["maxLength"]);
    }
  }

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): Uint8Array {
    return reader.readBuffer(raw, readVisitor({
      fromBuffer(input: Uint8Array): Uint8Array {
        return input;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: Uint8Array): W {
    return writer.writeBuffer(value);
  }

  testError(val: Uint8Array): Error | undefined {
    if (!(val instanceof Uint8Array)) {
      return createInvalidTypeError("Uint8Array", val);
    }
    if (this.maxLength !== undefined && val.length > this.maxLength) {
      return createMaxArrayLengthError(val, this.maxLength);
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
    throw createNotImplementedError("BufferType#diff");
  }

  patch(oldVal: Uint8Array, diff: Diff | undefined): Uint8Array {
    throw createNotImplementedError("BufferType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("BufferType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("BufferType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: BufferTypeOptions = typeof this._options === "function" ? this._options() : this._options;

    const maxLength: number = options.maxLength;

    Object.assign(this, {maxLength});
  }
}
