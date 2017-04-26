import {InvalidTimestampError} from "../errors/invalid-timestamp";
import {UnknownFormatError} from "../errors/unknown-format";
import {WrongTypeError} from "../errors/wrong-type";
import {VersionedType} from "../interfaces";

export type Name = "date";
export const name: Name = "date";
export type T = Date;
/* tslint:disable-next-line:no-namespace */
export namespace json {
  export type Input = string;
  export type Output = string;
  export type Type = undefined;
}
/* tslint:disable-next-line:no-namespace */
export namespace bson {
  export type Input = Date;
  export type Output = Date;
}
export type Diff = number;

export class DateType implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;

  toJSON(): undefined {
    return undefined;
  }

  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: any, val: any): any {
    switch (format) {
      case "json":
        return new Date(val);
      case "bson":
        return new Date(val.getTime());
    }
  }

  read(format: "json" | "bson", val: any): T {
    let result: Date;
    switch (format) {
      case "json":
        if (typeof val !== "string") {
          throw WrongTypeError.create("Date", val);
        }
        result = new Date(val);
        break;
      case "bson":
        if (!(val instanceof Date)) {
          throw WrongTypeError.create("Date", val);
        }
        result = new Date(val.getTime());
        break;
      default:
        throw UnknownFormatError.create(format);
    }
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  write(format: "json", val: T): json.Output;
  write(format: "bson", val: T): bson.Output;
  write(format: any, val: any): any {
    switch (format) {
      case "json":
        return val.toISOString();
      case "bson":
        return new Date(val.getTime());
    }
  }

  testError(val: T): Error | undefined {
    if (!(val instanceof Date)) {
      return WrongTypeError.create("Date", val);
    }
    const time: number = val.getTime();
    if (isNaN(time) || time > Number.MAX_SAFE_INTEGER || time < Number.MIN_SAFE_INTEGER) {
      return InvalidTimestampError.create(val);
    }

    return undefined;
  }

  test(val: T): val is T {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return val1.getTime() === val2.getTime();
  }

  clone(val: T): T {
    return new Date(val.getTime());
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return newVal.getTime() - oldVal.getTime() || undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return new Date(oldVal.getTime() + (diff || 0));
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

export {DateType as Type};
