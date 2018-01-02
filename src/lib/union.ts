import { Incident } from "incident";
import { NotImplementedError } from "./_errors/not-implemented";
import { UnknownFormatError } from "./_errors/unknown-format";
import { lazyProperties } from "./_helpers/lazy-properties";
import { Lazy, SerializableType, VersionedType } from "./types";

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
export type TestWithVariantResult<T> = [true, VersionedType<T, any, any, any>] | [false, VersionedType<T, any, any, any> | undefined];

export class UnionType<T>
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
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

  readTrustedWithVariant(format: "bson", val: bson.Output): [T, VersionedType<T, any, any, Diff>];
  readTrustedWithVariant(format: "json", val: json.Output): [T, VersionedType<T, any, any, Diff>];
  readTrustedWithVariant(format: "qs", val: qs.Output): [T, VersionedType<T, any, any, Diff>];
  readTrustedWithVariant(format: "bson" | "json" | "qs", input: any): [T, VersionedType<T, any, any, Diff>] {
    const variant: VersionedType<T, any, any, Diff> = this.readTrustedMatcher(format, input, this.variants);
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return [variant.readTrusted(<any> format, input), variant];
  }

  readWithVariant(format: "bson" | "json" | "qs", input: any): [T, VersionedType<T, any, any, Diff>] {
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        const variant: VersionedType<T, any, any, any> | undefined = this.readMatcher(format, input, this.variants);
        if (variant === undefined) {
          throw Incident("UnknownUnionVariant", "Unknown union variant");
        }
        return [variant.read(<any> format, input), variant];
      default:
        throw UnknownFormatError.create(format);
    }
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    return this.readTrustedWithVariant(format as any, input)[0];
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    return this.readWithVariant(format as any, input)[0];
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return this.trustedMatcher(val, this.variants).write(<any> format, val);
  }

  testError(val: T): Error | undefined {
    const type: VersionedType<T, any, any, any> | undefined = this.matcher(val, this.variants);
    if (type === undefined) {
      return Incident("UnknownUnionVariant", "Unknown union variant");
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

  // TODO: Always return true ?
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

export {UnionType as Type};
