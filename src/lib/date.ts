import { InvalidTimestampError } from "./_errors/invalid-timestamp";
import { WrongTypeError } from "./_errors/wrong-type";
import { BsonSerializer, QsSerializer, VersionedType } from "./types";

export type Name = "date";
export const name: Name = "date";
export type T = Date;
export namespace bson {
  export type Input = Date;
  export type Output = Date;
}
export namespace json {
  export type Input = string | number;
  export type Output = string;

  export interface Type {
    name: Name;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = number;

export class DateType
  implements VersionedType<T, json.Input, json.Output, Diff>,
    BsonSerializer<T, bson.Input, bson.Output>,
    QsSerializer<T, qs.Input, qs.Output> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name};
  }

  readTrustedJson(input: json.Output): T {
    return new Date(input);
  }

  readTrustedBson(input: bson.Output): T {
    return new Date(input.getTime());
  }

  readTrustedQs(input: qs.Output): T {
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

  readBson(input: any): T {
    let result: Date;
    if (!(input instanceof Date)) {
      throw WrongTypeError.create("Date", input);
    }
    result = new Date(input.getTime());
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  readQs(input: any): T {
    let result: Date;
    if (typeof input !== "string") {
      throw WrongTypeError.create("string", input);
    }
    result = new Date(input);
    const error: Error | undefined = this.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  writeJson(val: T): json.Output {
    return val.toISOString();
  }

  writeBson(val: T): bson.Output {
    return new Date(val.getTime());
  }

  writeQs(val: T): qs.Output {
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
