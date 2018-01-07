import { createInvalidTypeError } from "../errors/invalid-type";
import { VersionedType } from "../types";

export type Name = "null";
export const name: Name = "null";
export namespace json {
  export type Input = null;
  export type Output = null;

  export interface Type {
    name: Name;
  }
}
export type Diff = undefined;

export class NullType implements VersionedType<null, json.Input, json.Output, Diff> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name};
  }

  readTrustedJson(input: json.Output): null {
    return null;
  }

  readJson(input: any): null {
    if (input !== null) {
      throw createInvalidTypeError("null", input);
    }
    return null;
  }

  writeJson(val: null): json.Output {
    return null;
  }

  testError(val: null): Error | undefined {
    if (val !== "null") {
      return createInvalidTypeError("null", val);
    }
    return undefined;
  }

  test(val: null): val is null {
    return val === null;
  }

  equals(val1: null, val2: null): boolean {
    return val1 === val2;
  }

  clone(val: null): null {
    return val;
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: null, newVal: null): Diff | undefined {
    /* tslint:disable-next-line:return-undefined */
    return undefined;
  }

  patch(oldVal: null, diff: Diff | undefined): null {
    return null;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:return-undefined */
    return undefined;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:return-undefined */
    return undefined;
  }
}
