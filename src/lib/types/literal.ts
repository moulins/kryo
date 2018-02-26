import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { IoType, Lazy, Reader, Type, Writer } from "../core";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError } from "../errors/not-implemented";
import { testError } from "../test-error";

export type Name = "literal";
export const name: Name = "literal";
export type Diff = any;

/**
 * T: Typescript type
 * M: Kryo meta-type
 */
export interface LiteralTypeOptions<T, M extends Type<any> = Type<any>> {
  type: M;
  value: T;
}

export interface LiteralTypeConstructor {
  new<T>(options: Lazy<LiteralTypeOptions<T, IoType<any>>>): LiteralIoType<T>;

  new<T>(options: Lazy<LiteralTypeOptions<T>>): LiteralType<T>;
}

export interface LiteralType<T, M extends Type<any> = Type<any>> extends Type<T>, LiteralTypeOptions<T, M> {
}

export interface LiteralIoType<T, M extends IoType<any> = IoType<any>> extends IoType<T>, LiteralType<T, M> {
  read<R>(reader: Reader<R>, raw: R): T;

  write<W>(writer: Writer<W>, value: T): W;
}

/**
 * You may need to explicitly write the type or inference won't pick it.
 * For example, in the case of enum values, inference will pick the type of the enum instead of
 * the specific property you pass.
 *
 * @see https://github.com/Microsoft/TypeScript/issues/10195
 */
// tslint:disable-next-line:variable-name
export const LiteralType: LiteralTypeConstructor = class<T, M extends Type<T> = Type<T>> implements IoType<T> {
  readonly name: Name = name;
  readonly type: M;
  readonly value: T;

  private _options: Lazy<LiteralTypeOptions<T, M>>;

  constructor(options: Lazy<LiteralTypeOptions<T, M>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.type = <any> undefined;
    this.value = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["type", "value"]);
    }
  }

  read<R>(reader: Reader<R>, raw: R): T {
    if (this.type.read === undefined) {
      throw new Incident("NotReadable", {type: this});
    }
    return reader.trustInput ? this.clone(this.value) : this.type.read(reader, raw);
  }

  write<W>(writer: Writer<W>, value: T): W {
    if (this.type.write === undefined) {
      throw new Incident("NotWritable", {type: this});
    }
    return this.type.write(writer, value);
  }

  testError(val: T): Error | undefined {
    const error: Error | undefined = testError(this.type, val);
    if (error !== undefined) {
      return error;
    }
    if (!this.type.equals(val, this.value)) {
      return Incident("InvalidLiteral", "Invalid literal value");
    }
    return undefined;
  }

  test(value: T): boolean {
    return this.type.test(value) && this.type.equals(value, this.value);
  }

  equals(val1: T, val2: T): boolean {
    return this.type.equals(val1, val2);
  }

  clone(val: T): T {
    return this.type.clone(val);
  }

  diff(oldVal: T, newVal: T): undefined {
    return;
  }

  patch(oldVal: T, diff: undefined): T {
    return this.type.clone(oldVal);
  }

  reverseDiff(diff: Diff | undefined): undefined {
    return;
  }

  squash(diff1: undefined, diff2: undefined): undefined {
    return;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: LiteralTypeOptions<T, M> = typeof this._options === "function"
      ? this._options()
      : this._options;

    const type: M = options.type;
    const value: T = options.value;

    Object.assign(this, {type, value});
  }
};
