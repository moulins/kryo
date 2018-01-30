import { lazyProperties } from "../_helpers/lazy-properties";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError } from "../errors/not-implemented";
import { Lazy, Reader, Type, Writer } from "../types";

export type Name = "custom";
export const name: Name = "custom";

export type Read<T> = <R>(reader: Reader<R>, raw: R) => T;
export type Write<T> = <W>(writer: Writer<W>, value: T) => W;
export type TestError<T> = (val: T) => Error | undefined;
export type Equals<T> = (val1: T, val2: T) => boolean;
export type Clone<T> = (val: T) => T;

export interface CustomTypeOptions<T> {
  read: Read<T>;
  write: Write<T>;
  testError: TestError<T>;
  equals: Equals<T>;
  clone: Clone<T>;
}

export class CustomType<T> implements Type<T> {
  readonly name: Name = name;
  readonly read: Read<T>;
  readonly write: Write<T>;
  readonly testError: TestError<T>;
  readonly equals: Equals<T>;
  readonly clone: Clone<T>;

  private _options?: Lazy<CustomTypeOptions<T>>;

  constructor(options: Lazy<CustomTypeOptions<T>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.read = <any> undefined;
    this.write = <any> undefined;
    this.testError = <any> undefined;
    this.equals = <any> undefined;
    this.clone = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["read", "write", "testError", "equals", "clone"]);
    }
  }

  toJSON(): never {
    throw createNotImplementedError("CustomType#toJSON");
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: CustomTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;
    Object.assign(
      this,
      {
        read: options.read,
        write: options.write,
        testError: options.testError,
        equals: options.equals,
        clone: options.clone,
      },
    );
  }
}
