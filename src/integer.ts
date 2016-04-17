import {Type, TypeSync, StaticType} from "via-core";
import {promisifyClass} from "./helpers/promisify";
import {UnsupportedFormatError, UnexpectedTypeError, ViaTypeError} from "./helpers/via-type-error";

export class IntegerTypeError extends ViaTypeError {}

export class NumericError extends IntegerTypeError {
  constructor (value: number) {
    super (null, "NumericError", {value: value}, "Value is not a finite integer")
  }
}

export class IntegerTypeSync implements TypeSync<number, number> {
  isSync: boolean = true;
  name: string = "boolean";

  readTrustedSync(format: string, val: any): number {
    switch (format) {
      case "json":
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  readSync(format: string, val: any): number {
    switch (format) {
      case "json":
      case "bson":
        if (!(typeof val === "number")) {
          throw new UnexpectedTypeError(typeof val, "number");
        }
        if (!isFinite(val)) {
          throw new NumericError(val);
        }
        return Math.floor(val);
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  writeSync (format: string, val: number): any {
    switch (format) {
      case "json":
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  testSync (val: any): Error {
    if (!(typeof val === "number")) {
      return new UnexpectedTypeError(typeof val, "number");
    }
    if (!isFinite(val) || Math.floor(val) !== val) {
      return new NumericError(val);
    }
    return null;
  }

  equalsSync (val1: number, val2: number): boolean {
    return val1 === val2;
  }

  cloneSync (val: number): number {
    return val;
  }

  diffSync (oldVal: number, newVal: number): number {
    return newVal - oldVal;
  }

  patchSync (oldVal: number, diff: number): number {
    return oldVal + diff;
  }

  revertSync (newVal: number, diff: number): number {
    return newVal - diff;
  }
}

export let IntegerType: StaticType<number, number> = promisifyClass(IntegerTypeSync);
export type IntegerType = Type<number, number>;
