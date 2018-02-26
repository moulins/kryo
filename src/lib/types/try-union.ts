import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { IoType, Lazy, Reader, Type, VersionedType, Writer } from "../core";
import { createLazyOptionsError } from "../errors/lazy-options";

export type Name = "union";
export const name: Name = "union";
export type Diff = any;

export interface TryUnionTypeOptions<T, M extends Type<T> = Type<T>> {
  variants: M[];
}

export type TestWithVariantResult<T> =
  [true, VersionedType<T, any>]
  | [false, VersionedType<T, any> | undefined];

export class TryUnionType<T, M extends Type<T> = Type<T>> implements IoType<T>, TryUnionTypeOptions<T, M> {
  readonly name: Name = name;
  readonly variants: M[];

  private _options?: Lazy<TryUnionTypeOptions<T, M>>;

  constructor(options: Lazy<TryUnionTypeOptions<T, M>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.variants = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["variants"],
      );
    }
  }

  match(value: T): M | undefined {
    for (const variant of this.variants) {
      if (variant.test(value)) {
        return variant;
      }
    }
    return undefined;
  }

  matchTrusted(value: T): M {
    return this.match(value)!;
  }

  write<W>(writer: Writer<W>, value: T): W {
    const variant: M | undefined = this.match(value);
    if (variant === undefined) {
      throw new Incident("UnknownUnionVariant", "Unknown union variant");
    }
    if (variant.write === undefined) {
      throw new Incident("NotWritable", {type: variant});
    }
    return variant.write(writer, value);
  }

  read<R>(reader: Reader<R>, raw: R): T {
    return this.variantRead(reader, raw)[1];
  }

  variantRead<R>(reader: Reader<R>, raw: R): [M, T] {
    for (const variant of this.variants) {
      try {
        return [variant, variant.read!(reader, raw)];
      } catch (err) {
        // TODO: Do not swallow all errors
      }
    }
    throw new Incident("InputVariantNotFound", {union: this, raw});
  }

  testError(value: T): Error | undefined {
    const variant: M | undefined = this.match(value);
    if (variant === undefined) {
      return new Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return variant.testError(value);
  }

  test(val: T): boolean {
    const type: M | undefined = this.match(val);
    if (type === undefined) {
      return false;
    }
    return type.test(val);
  }

  // TODO: Always return true?
  equals(val1: T, val2: T): boolean {
    const type1: M = this.matchTrusted(val1);
    const type2: M = this.matchTrusted(val2);
    return type1 === type2 && type1.equals(val1, val2);
  }

  clone(val: T): T {
    return this.matchTrusted(val).clone(val);
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: TryUnionTypeOptions<T, M> = typeof this._options === "function"
      ? this._options()
      : this._options;
    delete this._options;
    const variants: M[] = options.variants;
    Object.assign(this, {variants});
  }
}
