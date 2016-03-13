import * as Promise from "bluebird";
import {Type, TypeSync, StaticType, promisifyClass} from "./interfaces/Type";

export class DateTypeSync implements TypeSync<Date, number> {
  isSync: boolean = true;
  name: string = "date";

  readSync(format: string, val: any): Date {
    switch (format) {
      case "json":
        if (_.isString(val)) {
          val = Date.parse(val);
        }
        if (_.isFinite(val)) {
          return new Date(val);
        }
        throw new Error("Expected value to be either string or finite number");
      case "bson":
        return val;
      default:
        throw new Error("Unsupported format");
    }
  }

  writeSync(format: string, val: Date): any {
    switch (format) {
      case "json":
        return val.toString();
      case "bson":
        return val;
      default:
        throw new Error("Unsupported format");
    }
  }

  testSync(val: any): Error {
    if (!(val instanceof Date)) {
      return new Error("Expected value to be instanceof Date");
    }
    if (isNaN(val.getTime())) {
      return new Error("Timestamp is NaN");
    }
    return null;
  }

  normalizeSync(val: any): Date {
    return val;
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
