import { Incident } from "incident";
import { NotImplementedError } from "./_errors/not-implemented";
import { lazyProperties } from "./_helpers/lazy-properties";
import { BsonSerializer, Lazy, QsSerializer, VersionedType } from "./types";

export type Name = "union";
export const name: Name = "union";
export namespace bson {
  export type Input = any;
  export type Output = any;
}
export namespace json {
  export type Input = any;
  export type Output = any;
  export type Type = undefined;
}
export namespace qs {
  export type Input = any;
  export type Output = any;
}
export type Diff = any;

export type Matcher<T, Output, Input extends Output, Diff> = (
  value: any,
  variants: VersionedType<T, Output, Input, Diff>[],
) => VersionedType<T, Output, Input, Diff> | undefined;

export type TrustedMatcher<T, Output, Input extends Output, Diff> = (
  value: T,
  variants: VersionedType<T, Output, Input, Diff>[],
) => VersionedType<T, Output, Input, Diff>;

export type ReadMatcher<T, Output, Input extends Output, Diff> = (
  format: "bson" | "json" | "qs",
  value: any,
  variants: VersionedType<T, Output, Input, Diff>[],
) => VersionedType<T, Output, Input, Diff> | undefined;

export type ReadTrustedMatcher<T, Output, Input extends Output, Diff> = (
  format: "bson" | "json" | "qs",
  value: any, // Union of the outputs
  variants: VersionedType<T, Output, Input, Diff>[],
) => VersionedType<T, Output, Input, Diff>;

export interface Options<T, Output, Input extends Output, Diff> {
  variants: VersionedType<T, Output, Input, Diff>[];
  matcher: Matcher<T, Output, Input, Diff>;
  trustedMatcher?: TrustedMatcher<T, Output, Input, Diff>;
  readMatcher: ReadMatcher<T, Output, Input, Diff>;
  readTrustedMatcher?: ReadTrustedMatcher<T, Output, Input, Diff>;
}

/* tslint:disable-next-line:max-line-length */
export type TestWithVariantResult<T> =
  [true, VersionedType<T, any, any, any>]
  | [false, VersionedType<T, any, any, any> | undefined];

export class UnionType<T>
  implements VersionedType<T, json.Input, json.Output, Diff>,
    BsonSerializer<T, bson.Input, bson.Output>,
    QsSerializer<T, qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly variants: VersionedType<T, any, any, Diff>[];
  readonly matcher: Matcher<T, any, any, Diff>;
  readonly trustedMatcher: TrustedMatcher<T, any, any, Diff>;
  readonly readMatcher: ReadMatcher<T, any, any, Diff>;
  readonly readTrustedMatcher: ReadTrustedMatcher<T, any, any, Diff>;

  private _options?: Lazy<Options<T, any, any, any>>;

  constructor(options: Lazy<Options<T, any, any, any>>, lazy?: boolean) {
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
        ["variants", "matcher", "trustedMatcher", "readMatcher", "readTrustedMatcher"],
      );
    }
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("UnionType#toJSON");
  }

  readTrustedJsonWithVariant(input: json.Output): [T, VersionedType<T, any, any, Diff>] {
    const variant: VersionedType<T, any, any, Diff> = this.readTrustedMatcher("json", input, this.variants);
    return [variant.readTrustedJson(input), variant];
  }

  readTrustedBsonWithVariant(input: bson.Output): [T, VersionedType<T, any, any, Diff>] {
    const variant: VersionedType<T, any, any, Diff> = this.readTrustedMatcher("bson", input, this.variants);
    // TODO(demurgos): Avoid casting
    return [(<any> variant as BsonSerializer<T>).readTrustedBson(input), variant];
  }

  readTrustedQsWithVariant(input: qs.Output): [T, VersionedType<T, any, any, Diff>] {
    const variant: VersionedType<T, any, any, Diff> = this.readTrustedMatcher("qs", input, this.variants);
    // TODO(demurgos): Avoid casting
    return [(<any> variant as QsSerializer<T>).readTrustedQs(input), variant];
  }

  readJsonWithVariant(input: any): [T, VersionedType<T, any, any, Diff>] {
    const variant: VersionedType<T, any, any, any> | undefined = this.readMatcher("json", input, this.variants);
    if (variant === undefined) {
      throw Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return [variant.readJson(input), variant];
  }

  readBsonWithVariant(input: any): [T, VersionedType<T, any, any, Diff>] {
    const variant: VersionedType<T, any, any, any> | undefined = this.readMatcher("bson", input, this.variants);
    if (variant === undefined) {
      throw Incident("UnknownUnionVariant", "Unknown union variant");
    }
    // TODO(demurgos): Avoid casting
    return [(<any> variant as BsonSerializer<T>).readBson(input), variant];
  }

  readQsWithVariant(input: any): [T, VersionedType<T, any, any, Diff>] {
    const variant: VersionedType<T, any, any, any> | undefined = this.readMatcher("qs", input, this.variants);
    if (variant === undefined) {
      throw Incident("UnknownUnionVariant", "Unknown union variant");
    }
    // TODO(demurgos): Avoid casting
    return [(<any> variant as QsSerializer<T>).readQs(input), variant];
  }

  readTrustedJson(input: json.Output): T {
    return this.readTrustedJsonWithVariant(input)[0];
  }

  readTrustedBson(input: bson.Output): T {
    return this.readTrustedBsonWithVariant(input)[0];
  }

  readTrustedQs(input: qs.Output): T {
    return this.readTrustedQsWithVariant(input)[0];
  }

  readJson(input: any): T {
    return this.readJsonWithVariant(input)[0];
  }

  readBson(input: any): T {
    return this.readBsonWithVariant(input)[0];
  }

  readQs(input: any): T {
    return this.readQsWithVariant(input)[0];
  }

  writeJson(val: T): json.Output {
    return this.trustedMatcher(val, this.variants).writeJson(val);
  }

  writeBson(val: T): bson.Output {
    // TODO(demurgos): Avoid casting
    return (<any> this.trustedMatcher(val, this.variants) as BsonSerializer<T>).writeBson(val);
  }

  writeQs(val: T): qs.Output {
    // TODO(demurgos): Avoid casting
    return (<any> this.trustedMatcher(val, this.variants) as QsSerializer<T>).writeQs(val);
  }

  testError(val: T): Error | undefined {
    const type: VersionedType<T, any, any, any> | undefined = this.matcher(val, this.variants);
    if (type === undefined) {
      return new Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return type.testError(val);
  }

  testWithVariant(val: T): TestWithVariantResult<T> {
    const variant: VersionedType<T, any, any, any> | undefined = this.matcher(val, this.variants);
    if (variant === undefined) {
      return [false, undefined];
    }
    return [variant.test(val), variant] as TestWithVariantResult<T>;
  }

  test(val: T): boolean {
    const type: VersionedType<T, any, any, any> | undefined = this.matcher(val, this.variants);
    if (type === undefined) {
      return false;
    }
    return type.test(val);
  }

  // TODO: Always return true?
  equals(val1: T, val2: T): boolean {
    const type1: VersionedType<T, any, any, any> = this.trustedMatcher(val1, this.variants);
    const type2: VersionedType<T, any, any, any> = this.trustedMatcher(val2, this.variants);
    return type1 === type2 && type1.equals(val1, val2);
  }

  clone(val: T): T {
    return this.trustedMatcher(val, this.variants).clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw NotImplementedError.create("UnionType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw NotImplementedError.create("UnionType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("UnionType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("UnionType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options<T, any, any, any> = typeof this._options === "function" ? this._options() : this._options;
    delete this._options;
    const variants: VersionedType<T, any, any, Diff>[] = options.variants;
    const matcher: Matcher<T, any, any, Diff> = options.matcher;

    let trustedMatcher: TrustedMatcher<T, any, any, Diff>;
    if (options.trustedMatcher !== undefined) {
      trustedMatcher = options.trustedMatcher;
    } else {
      trustedMatcher = (value: T, variants: VersionedType<T, any, any, any>[]) => {
        const variant: VersionedType<T, any, any, Diff> | undefined = matcher(value, variants);
        if (variant === undefined) {
          throw Incident("UnknownUnionVariant", "Unknown union variant");
        }
        return variant;
      };
    }

    const readMatcher: ReadMatcher<T, any, any, Diff> = options.readMatcher;

    let readTrustedMatcher: ReadTrustedMatcher<T, any, any, Diff>;
    if (options.readTrustedMatcher !== undefined) {
      readTrustedMatcher = options.readTrustedMatcher;
    } else {
      readTrustedMatcher = (
        format: "bson" | "json" | "qs",
        value: any,
        variants: VersionedType<T, any, any, any>[],
      ): VersionedType<T, any, any, any> => {
        const variant: VersionedType<T, any, any, Diff> | undefined = readMatcher(format, value, variants);
        if (variant === undefined) {
          throw Incident("UnknownUnionVariant", "Unknown union variant");
        }
        return variant;
      };
    }
    Object.assign(this, {variants, matcher, trustedMatcher, readMatcher, readTrustedMatcher});
    Object.freeze(this);
  }
}

export { UnionType as Type };
