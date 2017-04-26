import {Incident} from "incident";
import {WrongTypeError} from "../errors/wrong-type";
import {VersionedType} from "../interfaces";

export type Name = "float64";
export const name: Name = "float64";
export type T = number;
/* tslint:disable-next-line:no-namespace */
export namespace json {
  export type Input = number | "NaN" | "+Infinity" | "-Infinity";
  export type Output = number | "NaN" | "+Infinity" | "-Infinity";
  export interface Type {
    name: Name;
    notNan: boolean;
    notInfinity: boolean;
  }
}
export type Diff = [number, number];
export interface Options {
  notNan: boolean;
  notInfinity: boolean;
}
export const defaultOptions: Options = {
  notNan: true,
  notInfinity: true
};

export class Float64Type implements VersionedType<T, json.Input, json.Output, Diff> {
  static fromJSON(options: json.Type): Float64Type {
    return new Float64Type(options);
  }

  readonly name: Name = name;
  options: Options;

  constructor(options: Options) {
    this.options = {...defaultOptions, ...options};
  }

  toJSON(): json.Type {
    return {...this.options, name: name};
  }

  readTrusted(format: "json" | "bson", val: json.Output): T {
    if (typeof val === "number") {
      return val;
    }
    switch (val) {
      case "NaN":
        return NaN;
      case "+Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
    }
  }

  read(format: "json" | "bson", val: any): T {
    if (typeof val === "number") {
      return val;
    }
    switch (val) {
      case "NaN":
        if (this.options.notNan) {
          throw Incident("Nan", "NaN is not allowed");
        }
        return NaN;
      case "+Infinity":
        if (this.options.notNan) {
          throw Incident("Infinity", "+Infinity is not allowed");
        }
        return Infinity;
      case "-Infinity":
        if (this.options.notNan) {
          throw Incident("Infinity", "-Infinity is not allowed");
        }
        return -Infinity;
      default:
        throw Incident("InvalidNumberInput", "Expected a number, or one of NaN, +Infinity, -Infinity");
    }
  }

  write(format: "json" | "bson", val: T): json.Output {
    if (isNaN(val)) {
      return "NaN";
    } else if (val === Infinity) {
      return "+Infinity";
    } else if (val === -Infinity) {
      return "-Infinity";
    }
    return val;
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    if (isNaN(val) && this.options.notNan) {
      return Incident("");
    } else if (val === Infinity && this.options.notInfinity) {
      return Incident("Infinity", "+Infinity is not allowed");
    } else if (val === -Infinity && this.options.notInfinity) {
      return Incident("Infinity", "-Infinity is not allowed");
    }
    return undefined;
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    if (isNaN(val1) || isNaN(val2)) {
      return isNaN(val1) && isNaN(val2);
    }
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    // We can't use an arithmetic difference due to possible precision loss
    return this.equals(oldVal, newVal) ? undefined : [oldVal, newVal];
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return diff === undefined ? oldVal : diff[1];
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff === undefined ? undefined : [diff[1], diff[0]];
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2 === undefined ? undefined : [diff2[0], diff2[1]];
    } else if (diff2 === undefined) {
      return [diff1[0], diff1[1]];
    }
    return this.equals(diff1[0], diff2[1]) ? undefined : [diff1[0], diff2[1]];
  }
}

export {Float64Type as Type};
