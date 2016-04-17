import * as Promise from "bluebird";
import * as _ from "lodash";
import {Type, TypeSync, StaticType} from "via-core";
import {promisifyClass} from "./helpers/promisify";
import {UnsupportedFormatError, ViaTypeError} from "./helpers/via-type-error";

export class DateTypeError extends ViaTypeError {}

export class ReadJsonDateError extends DateTypeError {
  constructor (val: any) {
    super (null, "ReadJsonDateError", {value: val}, "Expected either string representation of date or finite integer");
  }
}

export class NanTimestampError extends DateTypeError {
  constructor (date: Date) {
    super (null, "NanTimestampError", {date: date}, "Expected timestamp to not be NaN");
  }
}

export class DateTypeSync implements TypeSync<Date, number> {
  isSync: boolean = true;
  name: string = "date";

  readTrustedSync(format: string, val: any): Date {
    switch (format) {
      case "json":
        return new Date(val);
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  readSync(format: string, val: any): Date {
    switch (format) {
      case "json":
        if (_.isString(val)) {
          val = Date.parse(val);
        }
        if (!_.isFinite(val)) {
          throw new ReadJsonDateError(val);
        }
        return new Date(val);
      case "bson":
        let err = this.testSync(val);
        if (err) {
          throw err;
        }
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  writeSync(format: string, val: Date): any {
    switch (format) {
      case "json":
        return val.toJSON(); // ISO8601 string with millisecond precision
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  testSync(val: any): Error {
    if (!(val instanceof Date)) {
      return new DateTypeError(null, "DateTypeError", {value: val}, "Expected value to be instanceof Date");
    }
    if (isNaN(val.getTime())) {
      return new NanTimestampError(val);
    }
    return null;
  }

  equalsSync(val1: Date, val2: Date): boolean {
    return val1.getTime() === val2.getTime();
  }

  cloneSync(val: Date): Date {
    return new Date(val.getTime());
  }

  diffSync(oldVal: Date, newVal: Date): number {
    return newVal.getTime() - oldVal.getTime();
  }

  patchSync(oldVal: Date, diff: number): Date {
    return new Date(oldVal.getTime() + diff);
  }

  revertSync(newVal: Date, diff: number): Date {
    return new Date(newVal.getTime() - diff);
  }
}

export let DateType: StaticType<Date, number> = promisifyClass(DateTypeSync);
export type DateType = Type<Date, number>;
