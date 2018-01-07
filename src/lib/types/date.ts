import { createInvalidTimestampError } from "../errors/invalid-timestamp";
import { createInvalidTypeError } from "../errors/invalid-type";
import { VersionedType } from "../types";

export type Name = "date";
export const name: Name = "date";
export namespace json {
  export type Input = string | number;
  export type Output = string;

  export interface Type {
    name: Name;
  }
}
export type Diff = number;

export class DateType implements VersionedType<Date, json.Input, json.Output, Diff> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name};
  }

  readTrustedJson(input: json.Output): Date {
    return new Date(input);
  }

  readJson(input: any): Date {
    let result: Date;
    if (typeof input === "string") {
      result = new Date(input);
    } else if (typeof input === "number") {
      result = new Date(input);
    } else {
      throw createInvalidTypeError("string | number", input);
    }
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  writeJson(val: Date): json.Output {
    return val.toISOString();
  }

  testError(val: Date): Error | undefined {
    if (!(val instanceof Date)) {
      return createInvalidTypeError("Date", val);
    }
    const time: number = val.getTime();
    if (isNaN(time) || time > Number.MAX_SAFE_INTEGER || time < Number.MIN_SAFE_INTEGER) {
      return createInvalidTimestampError(val);
    }

    return undefined;
  }

  test(val: Date): val is Date {
    return this.testError(val) === undefined;
  }

  equals(val1: Date, val2: Date): boolean {
    return val1.getTime() === val2.getTime();
  }

  clone(val: Date): Date {
    return new Date(val.getTime());
  }

  diff(oldVal: Date, newVal: Date): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return newVal.getTime() - oldVal.getTime() || undefined;
  }

  patch(oldVal: Date, diff: Diff | undefined): Date {
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
