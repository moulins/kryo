import {Incident} from "incident";
import {WrongTypeError} from "../errors/wrong-type";
import {VersionedType} from "../interfaces";

export type Name = "int32";
export const name: Name = "int32";
export type T = number;
export namespace json {
  export type Input = number;
  export type Output = number;
  export interface Type {
    name: Name;
  }
}
export type Diff = number;

export class Int32Type implements VersionedType<T, json.Input, json.Output, Diff> {
  static fromJSON(options: json.Type): Int32Type {
    return new Int32Type();
  }

  readonly name: Name = name;

  constructor() {}

  toJSON(): json.Type {
    return {name: name};
  }

  readTrusted(format: "json" | "bson", val: json.Output): T {
    return val;
  }

  read(format: "json" | "bson", val: any): T {
    if (typeof val !== "number") {
      throw WrongTypeError.create("number", val);
    }
    if ((val | 0) !== val) {
      throw Incident("NotInt32", val);
    }
    return val;
  }

  write(format: "json" | "bson", val: T): json.Output {
    return val;
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    if ((val | 0) !== val) {
      return Incident("NotInt32", val);
    }
    return undefined;
  }

  test(val: T): boolean {
    return typeof val === "number" && (val | 0) === val;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return newVal === oldVal ? undefined : newVal - oldVal;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return diff === undefined ? oldVal : oldVal + diff as T;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff && -diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2;
    } else if (diff2 === undefined) {
      return diff1;
    }
    return diff2 === -diff1 ? undefined : diff1 + diff2;
  }
}

export {Int32Type as Type};
