import {WrongTypeError} from "../errors/wrong-type";
import {VersionedType} from "../interfaces";

export type Name = "null";
export const name: Name = "null";
export type T = null;
export namespace json {
  export type Input = null;
  export type Output = null;
  export interface Type {
    name: Name;
  }
}
export type Diff = undefined;

export class NullType implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name: name};
  }

  readTrusted(format: "json" | "bson", val: json.Output): T {
    return null;
  }

  read(format: "json" | "bson", val: any): T {
    if (val !== null && val !== undefined) {
      throw WrongTypeError.create("null | undefined", val);
    }
    return null;
  }

  write(format: "json" | "bson", val: T): json.Output {
    return null;
  }

  testError(val: T): Error | undefined {
    if (val !== "null") {
      return WrongTypeError.create("null", val);
    }
    return undefined;
  }

  test(val: T): val is T {
    return val === null;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: T, newVal: T): Diff | undefined {
    return undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return null;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return undefined;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    return undefined;
  }
}

export {NullType as Type};
