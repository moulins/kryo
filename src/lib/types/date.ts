import { InvalidTimestampError } from "../errors/invalid-timestamp";
import { WrongTypeError } from "../errors/wrong-type";
import { VersionedType } from "../types";

export type Name = "date";
export const name: Name = "date";
export type T = Date;
export namespace json {
  export type Input = string | number;
  export type Output = string;

  export interface Type {
    name: Name;
  }
}
export type Diff = number;

export class DateType implements VersionedType<T, json.Input, json.Output, Diff> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name};
  }

  readTrustedJson(input: json.Output): T {
    return new Date(input);
  }

  readJson(input: any): T {
    let result: Date;
    if (typeof input === "string") {
      result = new Date(input);
    } else if (typeof input === "number") {
      result = new Date(input);
    } else {
      throw WrongTypeError.create("string | number", input);
    }
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  writeJson(val: T): json.Output {
    return val.toISOString();
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
    /* tslint:disable-next-line:strict-boolean-expressions */
    return newVal.getTime() - oldVal.getTime() || undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return new Date(oldVal.getTime() + (diff || 0));
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
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

export { DateType as Type };
