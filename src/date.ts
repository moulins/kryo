import * as Bluebird from "bluebird";
import * as _ from "lodash";

import {VersionedTypeSync, VersionedTypeAsync} from "./interfaces";
import {ViaTypeError} from "./helpers/via-type-error";

export class InvalidTimestampError extends ViaTypeError {
  constructor(date: Date) {
    super('invalid-timestamp', {date: date}, 'Invalid timestamp');
  }
}

const NAME = "date";

export interface DateOptions {}


function readSync(format: "json-doc" | "bson-doc", val: any, options?: DateOptions): Date {
  switch (format) {
    case "json-doc":
      if (_.isString(val)) {
        val = Date.parse(val);
      }
      if (!_.isFinite(val)) {
        throw new ViaTypeError("Unable to read JSON date");
      }
      val = new Date(val);
      break;
    case "bson-doc":
      break;
    default:
      throw new ViaTypeError("Unsupported format");
  }
  let err = testErrorSync(val);
  if (err) {
    throw err;
  }
  return val;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: any, options?: DateOptions): Date {
  return new Date(val);
}

function writeSync(format: "json-doc" | "bson-doc", val: Date, options?: DateOptions): any {
  return format === "json-doc" ? val.toJSON() : val;
}

function testErrorSync (val: Date, options?: DateOptions): Error | null {
  if (!(val instanceof Date)) {
    return new ViaTypeError(null, "DateTypeError", {value: val}, "Expected value to be instanceof Date");
  }
  if (isNaN(val.getTime())) {
    return new InvalidTimestampError(val);
  }

  return null;
}

function testSync (val: Date, options?: DateOptions): boolean {
  return testErrorSync(val) === null;
}

function equalsSync (val1: Date, val2: Date, options?: DateOptions): boolean {
  return val1.getTime() === val2.getTime();
}

function cloneSync (val: Date, options?: DateOptions): Date {
  return new Date(val.getTime());
}

function diffSync (oldVal: Date, newVal: Date, options?: DateOptions): number | null {
  return newVal.getTime() - oldVal.getTime();
}

function patchSync (oldVal: Date, diff: number | null, options?: DateOptions): Date {
  return new Date(oldVal.getTime() + diff);
}

function reverseDiffSync (diff: number | null, options?: DateOptions): number | null {
  return diff === null ? null : -diff;
}

function squashSync (diff1: number | null, diff2: number | null, options?: DateOptions): number | null {
  if (diff1 === null) {
    return diff2 === null ? null : diff2;
  } else {
    return diff2 === null ? diff1 : diff1 + diff2;
  }
}

export class DateType implements
  VersionedTypeSync<Date, number, DateOptions>,
  VersionedTypeAsync<Date, number, DateOptions> {

  isSync = true;
  isAsync = true;
  isCollection = true;
  type = NAME;
  types = [NAME];

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: any, options?: DateOptions): Date {
    return readTrustedSync(format, val, options);
  }

  readTrustedAsync (format: "json-doc" | "bson-doc", val: any, options?: DateOptions): Bluebird<Date> {
    return Bluebird.try(() => readTrustedSync(format, val, options));
  }

  readSync (format: "json-doc" | "bson-doc", val: any, options?: DateOptions): Date {
    return readSync(format, val, options);
  }

  readAsync (format: "json-doc" | "bson-doc", val: any, options?: DateOptions): Bluebird<Date> {
    return Bluebird.try(() => readSync(format, val, options));
  }

  writeSync (format: "json-doc" | "bson-doc", val: Date, options?: DateOptions): any {
    return writeSync(format, val, options);
  }

  writeAsync (format: "json-doc" | "bson-doc", val: Date, options?: DateOptions): Bluebird<any> {
    return Bluebird.try(() => writeSync(format, val, options));
  }

  testErrorSync (val: Date, options?: DateOptions): Error | null {
    return testErrorSync(val, options);
  }

  testErrorAsync (val: Date, options?: DateOptions): Bluebird<Error | null> {
    return Bluebird.try(() => testErrorSync(val, options));
  }

  testSync (val: Date, options?: DateOptions): boolean {
    return testSync(val, options);
  }

  testAsync (val: Date, options?: DateOptions): Bluebird<boolean> {
    return Bluebird.try(() => testSync(val, options));
  }

  equalsSync (val1: Date, val2: Date, options?: DateOptions): boolean {
    return equalsSync(val1, val2, options);
  }

  equalsAsync (val1: Date, val2: Date, options?: DateOptions): Bluebird<boolean> {
    return Bluebird.try(() => equalsSync(val1, val2, options));
  }

  cloneSync (val: Date, options?: DateOptions): Date {
    return cloneSync(val, options);
  }

  cloneAsync (val: Date, options?: DateOptions): Bluebird<Date> {
    return Bluebird.try(() => cloneSync(val, options));
  }

  diffSync (oldVal: Date, newVal: Date, options?: DateOptions): number | null {
    return diffSync(oldVal, newVal, options);
  }

  diffAsync (oldVal: Date, newVal: Date, options?: DateOptions): Bluebird<number | null> {
    return Bluebird.try(() => diffSync(oldVal, newVal, options));
  }

  patchSync (oldVal: Date, diff: number | null, options?: DateOptions): Date {
    return patchSync(oldVal, diff, options);
  }

  patchAsync (oldVal: Date, diff: number | null, options?: DateOptions): Bluebird<Date> {
    return Bluebird.try(() => patchSync(oldVal, diff, options));
  }

  reverseDiffSync(diff: number | null, options?: DateOptions): number | null {
    return reverseDiffSync(diff, options);
  }

  reverseDiffAsync(diff: number | null, options?: DateOptions): Bluebird<number | null> {
    return Bluebird.try(() => reverseDiffSync(diff, options));
  }

  squashSync(diff1: number | null, diff2: number | null, options?: DateOptions): number | null {
    return squashSync(diff1, diff2, options);
  }

  squashAsync(diff1: number | null, diff2: number | null, options?: DateOptions): Bluebird<number | null> {
    return Bluebird.try(() => squashSync(diff1, diff2, options));
  }
}
