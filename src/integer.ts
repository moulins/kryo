import {UnexpectedTypeError, ViaTypeError} from "./helpers/via-type-error";
import * as Bluebird from "bluebird";
import {TypeSync, TypeAsync} from "./interfaces";

import * as numberType from "./number";
import {NumberType} from "./number";

const NAME = "integer";

export interface NumberOptions {}


function diffSync (oldVal: number, newVal: number): number | null {
  return oldVal === newVal ? null : newVal - oldVal;
}

function patchSync (oldVal: number, diff: number | null): number {
  return diff === null ? oldVal : oldVal + diff;
}

function reverseDiffSync (diff: number | null): number | null {
  return diff === null ? null : -diff;
}

export class IntegerType implements
  TypeSync<number, number, NumberOptions>,
  TypeAsync<number, number, NumberOptions> {

  isSync = true;
  isAsync = true;
  isCollection = true;
  type = NAME;
  types = [NAME];

  numberType: NumberType = null;

  constructor () {
    this.numberType = new NumberType();
  }

  toJSON(): null {  // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: any): number {
    return val;
  }

  readTrustedAsync (format: "json-doc" | "bson-doc", val: any): Bluebird<number> {
      return Bluebird.resolve(val);
  }

  readSync (format: "json-doc" | "bson-doc", val: any): number {
    const numVal = this.numberType.readSync(format, val);
    if (Math.floor(numVal) !== numVal) {
      throw new Error("Not an integer");
    }
    return numVal;
  }

  readAsync (format: "json-doc" | "bson-doc", val: any): Bluebird<number> {
    return Bluebird.try(() => this.readSync(format, val));
  }

  writeSync (format: "json-doc" | "bson-doc", val: number): any {
    return val;
  }

  writeAsync (format: "json-doc" | "bson-doc", val: number): Bluebird<any> {
    return Bluebird.resolve(val);
  }

  testErrorSync (val: any): Error | null {
    let err = this.numberType.testErrorSync(val);
    if (err === null && Math.floor(val) !== val) {
      err = new Error("Not an integer");
    }
    return err;
  }

  testErrorAsync (val: any): Bluebird<Error | null> {
    return Bluebird.try(() => this.testErrorSync(val));
  }

  testSync (val: any): boolean {
    return this.testErrorSync(val) === null;
  }

  testAsync (val: any): Bluebird<boolean> {
    return Bluebird
      .try(() => this.testErrorAsync(val))
      .then((result) => result === null);
  }

  equalsSync (val1: number, val2: number): boolean {
    return val1 === val2;
  }

  equalsAsync (val1: number, val2: number): Bluebird<boolean> {
    return Bluebird.resolve(val1 === val2);
  }

  cloneSync (val: number): number {
    return val;
  }

  cloneAsync (val: number): Bluebird<number> {
    return Bluebird.resolve(val);
  }

  diffSync (oldVal: number, newVal: number): number | null {
    return diffSync(oldVal, newVal);
  }

  diffAsync (oldVal: number, newVal: number): Bluebird<number | null> {
    return Bluebird.try(() =>  diffSync(oldVal, newVal));
  }

  patchSync (oldVal: number, diff: number | null): number {
    return patchSync(oldVal, diff);
  }

  patchAsync (oldVal: number, diff: number | null): Bluebird<number> {
    return Bluebird.try(() => patchSync(oldVal, diff));
  }
}

export class NumberTypeError extends ViaTypeError {}

export class NumericError extends NumberTypeError {
  constructor (value: number) {
    super (null, "NumericError", {value: value}, "Value is not a number")
  }
}
