import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError } from "../errors/not-implemented";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Lazy, Reader, VersionedType, Writer } from "../types";
import { DocumentType } from "./document";
import { LiteralType } from "./literal";
import { SimpleEnumType } from "./simple-enum";

export type Name = "union";
export const name: Name = "union";
export namespace json {
  export type Type = undefined;
}
export type Diff = any;

export interface TaggedUnionTypeOptions<T extends {}, M extends DocumentType<T> = DocumentType<T>> {
  variants: M[];
  tag: keyof T;
}

export type TestWithVariantResult<T> =
  [true, VersionedType<T, any>]
  | [false, VersionedType<T, any> | undefined];

export class TaggedUnionType<T extends {}, M extends DocumentType<T> = DocumentType<T>> implements IoType<T>,
  TaggedUnionTypeOptions<T, M> {
  readonly name: Name = name;
  readonly variants: M[];
  readonly tag: keyof T;

  private _options?: Lazy<TaggedUnionTypeOptions<T, M>>;

  private _outTag: string | undefined;

  private _tagType: SimpleEnumType<any> | undefined;

  private _valueToVariantMap: Map<any, M> | undefined;

  constructor(options: Lazy<TaggedUnionTypeOptions<T, M>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.variants = <any> undefined;
    this.tag = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["variants", "tag"],
      );
    }
  }

  toJSON(): json.Type {
    throw createNotImplementedError("UnionType#toJSON");
  }

  match(value: T): M | undefined {
    const tag: keyof T = this.tag;
    const tagValue: any = value[tag];
    if (tagValue === undefined) {
      return undefined;
      // throw new Incident("MissingTag", {union: this, value});
    }
    const variant: M | undefined = this.getValueToVariantMap().get(tagValue); // tagToVariant
    if (variant === undefined) {
      return undefined;
      // throw new Incident("VariantNotFound", {union: this, value});
    }
    return variant;
  }

  matchTrusted(value: T): M {
    return this.match(value)!;
  }

  write<W>(writer: Writer<W>, value: T): W {
    const variant: M | undefined = this.match(value);
    if (variant === undefined) {
      throw new Incident("VariantNotFound", {union: this, value});
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
    return reader.readDocument(raw, readVisitor({
      fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): [M, T] => {
        const outTag: string = this.getOutTag();
        if (!input.has(outTag as any)) { // TODO: remove cast
          throw new Incident("MissingOutTag");
        }
        const outTagRawValue: any = input.get(outTag as any); // TODO: remove cast
        const tagValue: any = this.getTagType().read(valueReader, outTagRawValue);
        const variant: M | undefined = this.getValueToVariantMap().get(tagValue); // tagToVariant
        if (variant === undefined) {
          throw new Incident("VariantNotFound", {union: this, tagValue});
        }
        return [variant, variant.read!(reader, raw)];
      },
    }));
  }

  testError(value: T): Error | undefined {
    if (typeof value !== "object" || value === null) {
      return createInvalidTypeError("object", value);
    }
    const variant: M | undefined = this.match(value);
    if (variant === undefined) {
      return new Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return variant.testError(value);
  }

  // testWithVariant(val: T): TestWithVariantResult<T> {
  //   const variant: M | undefined = this.match(val);
  //   if (variant === undefined) {
  //     return [false as false, undefined];
  //   }
  //   return [variant.test(val), variant] as TestWithVariantResult<T>;
  // }

  test(value: T): boolean {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    const type: M | undefined = this.match(value);
    if (type === undefined) {
      return false;
    }
    return type.test(value);
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
    const options: TaggedUnionTypeOptions<T, M> = typeof this._options === "function"
      ? this._options()
      : this._options;
    delete this._options;
    const variants: M[] = options.variants;
    const tag: keyof T = options.tag;
    Object.assign(this, {variants, tag});
  }

  /**
   * Returns the serialized name of the tag property
   */
  private getOutTag(): string {
    if (this._outTag === undefined) {
      const tag: keyof T = this.tag;
      let outTag: string | undefined = undefined;
      for (const variant of this.variants) {
        const cur: string = variant.getOutKey(tag);
        if (outTag === undefined) {
          outTag = cur;
        } else if (cur !== outTag) {
          throw new Incident("MixedOutTag", {tag, out: [cur, outTag]});
        }
      }
      if (outTag === undefined) {
        throw new Incident("AssertionFailed", "Expected outTag to be defined");
      }
      this._outTag = outTag;
    }
    return this._outTag;
  }

  private getTagType(): SimpleEnumType<any> {
    if (this._tagType === undefined) {
      const tag: keyof T = this.tag;
      let tagType: SimpleEnumType<any> | undefined = undefined;
      for (const variant of this.variants) {
        const lit: LiteralType<any> = variant.properties[tag].type as any;
        const cur: SimpleEnumType<any> = lit.type as any;
        if (tagType === undefined) {
          tagType = cur;
        } else if (cur !== tagType) {
          throw new Incident("MixedTagType", {tag, type: [cur, tagType]});
        }
      }
      if (tagType === undefined) {
        throw new Incident("AssertionFailed", "Expected tagType to be defined");
      }
      this._tagType = tagType;
    }
    return this._tagType;
  }

  private getValueToVariantMap(): Map<any, M> {
    if (this._valueToVariantMap === undefined) {
      const tag: keyof T = this.tag;
      const valueToVariantMap: Map<any, M> = new Map();
      for (const variant of this.variants) {
        const lit: LiteralType<any> = variant.properties[tag].type as any;
        if (valueToVariantMap.has(lit.value)) {
          throw new Incident("DuplicateTagValue", {value: lit.value});
        }
        valueToVariantMap.set(lit.value, variant);
      }
      if (valueToVariantMap === undefined) {
        throw new Incident("AssertionFailed", "Expected valueToVariantMap to be defined");
      }
      this._valueToVariantMap = valueToVariantMap;
    }
    return this._valueToVariantMap;
  }
}
