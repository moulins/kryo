import * as Promise from "bluebird";
import {Type, TypeSync} from "./interfaces/Type";

export class DateType implements Type, TypeSync{
  name: string = "date";
  options: {[key: string]: any};

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
      default:
        return val;
    }
  }

  read(format: string, val: Date): Promise<Date> {
    return Promise.resolve(this.readSync(format, val));
  }

  writeSync(format: string, val: Date): any {
    switch (format) {
      case "json":
        return val.toString();
      case "bson":
      default:
        return val;
    }
  }

  write(format: string, val: Date): Promise<any> {
    return Promise.resolve(this.writeSync(format, val));
  }

  testSync(val: any): boolean|Error {
    if (!(val instanceof Date)) {
      return new Error("Expected value to be instanceof Date")
    }
    if (isNaN(val.getTime())) {
      return new Error("Timestamp is NaN")
    }
    return true;
  }

  test(val: any): Promise<boolean|Error> {
    return Promise.resolve(this.testSync(val));
  }

  normalizeSync(val: any): Date {
    return val;
  }

  normalize(val: any): Promise<Date> {
    return Promise.resolve(val);
  }

  equalsSync(val1: Date, val2: Date): boolean {
    return val1.getTime() === val2.getTime();
  }

  equals(val1: Date, val2: Date): Promise<boolean> {
    return Promise.resolve(val1.getTime() === val2.getTime());
  }

  cloneSync(val: Date): Date {
    return new Date(val.getTime());
  }

  clone(val: Date): Promise<Date> {
    return Promise.resolve(this.cloneSync(val));
  }

  diffSync(oldVal: Date, newVal: Date): number {
    return newVal.getTime() - oldVal.getTime();
  }

  diff(oldVal: Date, newVal: Date): Promise<number> {
    return Promise.resolve(this.diffSync(oldVal, newVal));
  }

  patchSync(oldVal: Date, diff: number): Date {
    return new Date(oldVal.getTime() + diff);
  }

  patch(oldVal: Date, diff: number): Promise<Date> {
    return Promise.resolve(this.patchSync(oldVal, diff));
  }

  revertSync(newVal: Date, diff: number): Date {
    return new Date(newVal.getTime() - diff);
  }

  revert(newVal: Date, diff: number): Promise<Date> {
    return Promise.resolve(this.revertSync(newVal, diff));
  }
}
