import {UnexpectedTypeError, ViaTypeError} from "./helpers/via-type-error";
import * as Bluebird from "bluebird";
import {TypeSync, TypeAsync} from "./interfaces";

const NAME = "number";

export interface NumberOptions {}


function readSync(format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
  if (!(typeof val === "number")) {
    throw new UnexpectedTypeError(typeof val, "number");
  }
  if (!isFinite(val)) {
    throw new NumericError(val);
  }
  return val;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
  return val;
}

function writeSync(format: "json-doc" | "bson-doc", val: number, options?: NumberOptions): number {
  return val;
}

function testErrorSync (val: any, options?: NumberOptions): Error | null {
  if (!(typeof val === "number")) {
    return new UnexpectedTypeError(typeof val, "number");
  }
  if (!isFinite(val)) {
    return new NumericError(val);
  }
  return null;
}

function testSync (val: any, options?: NumberOptions): boolean {
  return testErrorSync(val) === null;
}

function equalsSync (val1: number, val2: number, options?: NumberOptions): boolean {
  return val1 === val2;
}

function cloneSync (val: number, options?: NumberOptions): number {
  return val;
}

function diffSync (oldVal: number, newVal: number, options?: NumberOptions): [number, number] {
  return oldVal === newVal ? null : [oldVal, newVal]; // We can't use an arithmetic difference due to possible precision loss
}

function patchSync (oldVal: number, diff: [number, number] | null, options?: NumberOptions): number {
  return diff === null ? oldVal : diff[1];
}

function revertSync (newVal: number, diff: [number, number] | null, options?: NumberOptions): number {
  return diff === null ? newVal : diff[0];
}

export class NumberType implements
  TypeSync<number, [number, number], NumberOptions>,
  TypeAsync<number, [number, number], NumberOptions> {

  isSync = true;
  isAsync = true;
  isCollection = true;
  type = NAME;
  types = [NAME];

  toJSON(): null {  // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
    return readTrustedSync(format, val, options);
  }

  readTrustedAsync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): Bluebird<number> {
    return Bluebird.try(() => readTrustedSync(format, val, options));
  }

  readSync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
    return readSync(format, val, options);
  }

  readAsync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): Bluebird<number> {
    return Bluebird.try(() => readSync(format, val, options));
  }

  writeSync (format: "json-doc" | "bson-doc", val: number, options?: NumberOptions): any {
    return writeSync(format, val, options);
  }

  writeAsync (format: "json-doc" | "bson-doc", val: number, options?: NumberOptions): Bluebird<any> {
    return Bluebird.try(() => writeSync(format, val, options));
  }

  testErrorSync (val: any, options?: NumberOptions): Error | null {
    return testErrorSync(val, options);
  }

  testErrorAsync (val: any, options?: NumberOptions): Bluebird<Error | null> {
    return Bluebird.try(() => testErrorSync(val, options));
  }

  testSync (val: any, options?: NumberOptions): boolean {
    return testSync(val, options);
  }

  testAsync (val: any, options?: NumberOptions): Bluebird<boolean> {
    return Bluebird.try(() => testSync(val, options));
  }

  equalsSync (val1: number, val2: number, options?: NumberOptions): boolean {
    return equalsSync(val1, val2, options);
  }

  equalsAsync (val1: number, val2: number, options?: NumberOptions): Bluebird<boolean> {
    return Bluebird.try(() => equalsSync(val1, val2, options));
  }

  cloneSync (val: number, options?: NumberOptions): number {
    return cloneSync(val, options);
  }

  cloneAsync (val: number, options?: NumberOptions): Bluebird<number> {
    return Bluebird.try(() =>  cloneSync(val, options));
  }

  diffSync (oldVal: number, newVal: number, options?: NumberOptions): [number, number] | null {
    return diffSync(oldVal, newVal, options);
  }

  diffAsync (oldVal: number, newVal: number, options?: NumberOptions): Bluebird<[number, number] | null> {
    return Bluebird.try(() =>  diffSync(oldVal, newVal, options));
  }

  patchSync (oldVal: number, diff: [number, number] | null, options?: NumberOptions): number {
    return patchSync(oldVal, diff, options);
  }

  patchAsync (oldVal: number, diff: [number, number] | null, options?: NumberOptions): Bluebird<number> {
    return Bluebird.try(() => patchSync(oldVal, diff, options));
  }

  revertSync(newVal: number, diff: [number, number] | null, options?: NumberOptions): number {
    return revertSync(newVal, diff, options);
  }

  revertAsync(newVal: number, diff: [number, number] | null, options?: NumberOptions): Bluebird<number> {
    return Bluebird.try(() => revertSync(newVal, diff, options));
  }
}

export class NumberTypeError extends ViaTypeError {}

export class NumericError extends NumberTypeError {
  constructor (value: number) {
    super (null, "NumericError", {value: value}, "Value is not a number")
  }
}
