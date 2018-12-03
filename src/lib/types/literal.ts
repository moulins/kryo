import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { IoType, Lazy, Reader, Type, Writer } from "../core";
import { createLazyOptionsError } from "../errors/lazy-options";
import { testError } from "../test-error";

export type Name = "literal";
export const name: Name = "literal";
export type Diff = any;

/**
 * T: Typescript type
 * K: Kryo type
 */
export interface LiteralTypeOptions<T, K extends Type<any> = Type<any>> {
  type: K;
  value: T;
}

export interface LiteralTypeConstructor {
  new<T>(options: Lazy<LiteralTypeOptions<T, IoType<any>>>): LiteralIoType<T>;

  new<T>(options: Lazy<LiteralTypeOptions<T>>): LiteralType<T>;
}

export interface LiteralType<T, K extends Type<any> = Type<any>> extends Type<T>, LiteralTypeOptions<T, K> {
}

export interface LiteralIoType<T, K extends IoType<any> = IoType<any>> extends IoType<T>, LiteralType<T, K> {
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
export const LiteralType: LiteralTypeConstructor = class<TT, K extends Type<any> = Type<any>> implements IoType<TT> {
  readonly name: Name = name;
  readonly type!: K;
  readonly value!: TT;

  private _options: Lazy<LiteralTypeOptions<TT, K>>;

  constructor(options: Lazy<LiteralTypeOptions<TT, K>>) {
    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["type", "value"]);
    }
  }

  read<R>(reader: Reader<R>, raw: R): TT {
    if (this.type.read === undefined) {
      throw new Incident("NotReadable", {type: this});
    }
    return reader.trustInput ? this.clone(this.value) : this.type.read(reader, raw);
  }

  write<W>(writer: Writer<W>, value: TT): W {
    if (this.type.write === undefined) {
      throw new Incident("NotWritable", {type: this});
    }
    return this.type.write(writer, value);
  }

  testError(val: TT): Error | undefined {
    const error: Error | undefined = testError(this.type, val);
    if (error !== undefined) {
      return error;
    }
    if (!this.type.equals(val, this.value)) {
      return Incident("InvalidLiteral", "Invalid literal value");
    }
    return undefined;
  }

  test(value: TT): boolean {
    return this.type.test(value) && this.type.equals(value, this.value);
  }

  equals(val1: TT, val2: TT): boolean {
    return this.type.equals(val1, val2);
  }

  clone(val: TT): TT {
    return this.type.clone(val);
  }

  diff(_oldVal: TT, _newVal: TT): undefined {
    return;
  }

  patch(oldVal: TT, _diff: undefined): TT {
    return this.type.clone(oldVal);
  }

  reverseDiff(_diff: Diff | undefined): undefined {
    return;
  }

  squash(_diff1: undefined, _diff2: undefined): undefined {
    return;
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: LiteralTypeOptions<TT, K> = typeof this._options === "function"
      ? this._options()
      : this._options;

    const type: K = options.type;
    const value: TT = options.value;

    Object.assign(this, {type, value});
  }
};
