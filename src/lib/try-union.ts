import { NotImplementedError } from "./_errors/not-implemented";
import { Lazy, VersionedType } from "./_interfaces";
import * as union from "./union";

export type Name = "try-union";
export const name: Name = "try-union";
export namespace bson {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }
}
export namespace json {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }

  export type Type = undefined;
}
export namespace qs {
  export interface Input {
    [key: string]: any;
  }

  export interface Output {
    [key: string]: any;
  }
}
export type Diff = any;

export interface Options<T, Output, Input extends Output, Diff> {
  variants: VersionedType<T, any, any, Diff>[];
}

function toUnionOptions<T>(options: Options<T, any, any, any>): union.Options<T, any, any, any> {
  const variants: VersionedType<T, any, any, Diff>[] = options.variants;
  const matcher: union.Matcher<T, any, any, any> = (value: any) => {
    for (const variant of variants) {
      if (variant.test(value)) {
        return variant;
      }
    }
    return undefined;
  };
  const readMatcher: union.ReadMatcher<T, any, any, any> = (format: "bson" | "json" | "qs", value: any) => {
    for (const variant of variants) {
      try {
        variant.read(format as any, value);
        return variant;
      } catch (err) {
        // Ignore error and try next variant
      }
    }
    return undefined;
  };
  return {variants: options.variants, matcher, readMatcher};
}

export class TryUnionType<T extends {}> extends union.UnionType<T> {
  readonly names: string[] = [this.name, name];

  constructor(options: Lazy<Options<T, any, any, any>>, lazy?: boolean) {
    super(() => toUnionOptions(typeof options === "function" ? options() : options), lazy);
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("TryUnionType#toJSON");
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw NotImplementedError.create("TryUnionType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw NotImplementedError.create("TryUnionType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("TryUnionType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("TryUnionType#squash");
  }
}

export {TryUnionType as Type};
