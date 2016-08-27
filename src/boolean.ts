import * as Bluebird from "bluebird";
import * as _ from "lodash";

import {VersionedTypeSync, VersionedTypeAsync} from "./interfaces";
import {UnexpectedTypeError, ViaTypeError} from "./helpers/via-type-error";


const NAME = "boolean";

export interface BooleanOptions {}


function readSync(format: "json-doc" | "bson-doc", val: any): boolean {
  return Boolean(val);
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: boolean): boolean {
  return val;
}

function writeSync(format: "json-doc" | "bson-doc", val: boolean): boolean {
  return val;
}

function testErrorSync (val: boolean): Error | null {
  if (typeof val !== "boolean") {
    return new UnexpectedTypeError(typeof val, "boolean");
  }
  return null;
}

function testSync (val: boolean): boolean {
  return testErrorSync(val) === null;
}

function equalsSync (val1: boolean, val2: boolean): boolean {
  return val1 === val2;
}

function cloneSync (val: boolean): boolean {
  return val;
}

/**
 * Creates a diff between two boolean values.
 *
 * @param oldVal
 * @param newVal
 * @param options
 * @returns {boolean|null} `true` if there is a difference, `null` otherwise
 */
function diffSync (oldVal: boolean, newVal: boolean): boolean | null {
  return (oldVal !== newVal) && null;
}

function patchSync (oldVal: boolean, diff: boolean | null): boolean {
  return oldVal === (diff === null);
}

function reverseDiffSync (diff: boolean | null): boolean {
  return diff;
}

function squashSync (diff1: boolean | null, diff2: boolean | null): boolean | null {
  return (diff1 !== diff2) && null;
}

export class BooleanType implements
  VersionedTypeSync<boolean, boolean, BooleanOptions>,
  VersionedTypeAsync<boolean, boolean, BooleanOptions> {

  isSync = true;
  isAsync = true;
  isCollection = true;
  type = NAME;
  types = [NAME];

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: boolean): boolean {
    return readTrustedSync(format, val);
  }

  readTrustedAsync (format: "json-doc" | "bson-doc", val: boolean): Bluebird<boolean> {
    return Bluebird.try(() => readTrustedSync(format, val));
  }

  readSync (format: "json-doc" | "bson-doc", val: any): boolean {
    return readSync(format, val);
  }

  readAsync (format: "json-doc" | "bson-doc", val: any): Bluebird<boolean> {
    return Bluebird.try(() => readSync(format, val));
  }

  writeSync (format: "json-doc" | "bson-doc", val: boolean): any {
    return writeSync(format, val);
  }

  writeAsync (format: "json-doc" | "bson-doc", val: boolean): Bluebird<any> {
    return Bluebird.try(() => writeSync(format, val));
  }

  testErrorSync (val: boolean): Error | null {
    return testErrorSync(val);
  }

  testErrorAsync (val: boolean): Bluebird<Error | null> {
    return Bluebird.try(() => testErrorSync(val));
  }

  testSync (val: boolean): boolean {
    return testSync(val);
  }

  testAsync (val: boolean): Bluebird<boolean> {
    return Bluebird.try(() => testSync(val));
  }

  equalsSync (val1: boolean, val2: boolean): boolean {
    return equalsSync(val1, val2);
  }

  equalsAsync (val1: boolean, val2: boolean): Bluebird<boolean> {
    return Bluebird.try(() => equalsSync(val1, val2));
  }

  cloneSync (val: boolean): boolean {
    return cloneSync(val);
  }

  cloneAsync (val: boolean): Bluebird<boolean> {
    return Bluebird.try(() => cloneSync(val));
  }

  diffSync (oldVal: boolean, newVal: boolean): boolean | null {
    return diffSync(oldVal, newVal);
  }

  diffAsync (oldVal: boolean, newVal: boolean): Bluebird<boolean | null> {
    return Bluebird.try(() => diffSync(oldVal, newVal));
  }

  patchSync (oldVal: boolean, diff: boolean | null): boolean {
    return patchSync(oldVal, diff);
  }

  patchAsync (oldVal: boolean, diff: boolean | null): Bluebird<boolean> {
    return Bluebird.try(() => patchSync(oldVal, diff));
  }

  reverseDiffSync(diff: boolean | null): boolean | null {
    return reverseDiffSync(diff);
  }

  reverseDiffAsync(diff: boolean | null): Bluebird<boolean | null> {
    return Bluebird.try(() => reverseDiffSync(diff));
  }

  squashSync(diff1: boolean | null, diff2: boolean | null): boolean | null {
    return squashSync(diff1, diff2);
  }

  squashAsync(diff1: boolean | null, diff2: boolean | null): Bluebird<boolean | null> {
    return Bluebird.try(() => squashSync(diff1, diff2));
  }
}
