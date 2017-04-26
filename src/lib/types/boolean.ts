import {WrongTypeError} from "../errors/wrong-type";
import {VersionedType} from "../interfaces";

export type Name = "boolean";
export const name: Name = "boolean";
export type T = boolean;
/* tslint:disable-next-line:no-namespace */
export namespace json {
  export type Input = boolean;
  export type Output = boolean;
}
export type Diff = boolean;

export class BooleanType implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;

  toJSON(): undefined {
    return undefined;
  }

  readTrusted(format: "json" | "bson", val: json.Output): T {
    return val;
  }

  read(format: "json" | "bson", val: any): T {
    if (typeof val !== "boolean") {
      throw WrongTypeError.create("boolean", val);
    }
    return val;
  }

  write(format: "json" | "bson", val: T): json.Output {
    return val;
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "boolean") {
      return WrongTypeError.create("boolean", val);
    }
    return undefined;
  }

  test(val: T): val is T {
    return this.testError(val) === undefined;
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
    return (oldVal !== newVal) || undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return oldVal === (diff === undefined);
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    return (diff1 !== diff2) && undefined;
  }
}

export {BooleanType as Type};
