import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { WrongTypeError } from "../errors/wrong-type";
import { Lazy, VersionedType } from "../types";

export type Name = "float64";
export const name: Name = "float64";
export type T = number;
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
  notNan?: boolean;
  notInfinity?: boolean;
}

export class Float64Type implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;
  readonly notNan: boolean; // TODO(demurgos): rename to allowNaN
  readonly notInfinity: boolean; // TODO(demurgos): rename to allowInfinity

  private _options: Lazy<Options>;

  constructor(options?: Lazy<Options>, lazy?: boolean) {
    if (options === undefined) {
      this._options = {};
      this._applyOptions();
      return;
    }
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
        ["notNan", "notInfinity"],
      );
    }
  }

  static fromJSON(options: json.Type): Float64Type {
    return new Float64Type(options);
  }

  toJSON(): json.Type {
    return {
      name,
      notNan: this.notNan,
      notInfinity: this.notInfinity,
    };
  }

  readTrustedJson(input: json.Output): T {
    switch (input) {
      case "NaN":
        return NaN;
      case "+Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      default:
        return input;
    }
  }

  readJson(input: any): T {
    if (typeof input === "number") {
      return input;
    }
    switch (input) {
      case "NaN":
        if (this.notNan) {
          throw Incident("Nan", "NaN is not allowed");
        }
        return NaN;
      case "+Infinity":
        if (this.notNan) {
          throw Incident("Infinity", "+Infinity is not allowed");
        }
        return Infinity;
      case "-Infinity":
        if (this.notNan) {
          throw Incident("Infinity", "-Infinity is not allowed");
        }
        return -Infinity;
      default:
        throw Incident("InvalidNumberInput", "Expected a number, or one of NaN, +Infinity, -Infinity");
    }
  }

  writeJson(val: T): json.Output {
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
    if (isNaN(val) && this.notNan) {
      return Incident("");
    } else if (val === Infinity && this.notInfinity) {
      return Incident("Infinity", "+Infinity is not allowed");
    } else if (val === -Infinity && this.notInfinity) {
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

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options = typeof this._options === "function" ? this._options() : this._options;

    let notNan: boolean = true;
    let notInfinity: boolean = true;
    if (options !== undefined) {
      notNan = options.notNan !== undefined ? options.notNan : notNan;
      notInfinity = options.notInfinity !== undefined ? options.notInfinity : notInfinity;
    }

    Object.assign(this, {notNan, notInfinity});
    Object.freeze(this);
  }
}

export { Float64Type as Type };
