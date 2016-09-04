import * as Bluebird from "bluebird";
import * as _ from "lodash";

import {
  TypeSync, TypeAsync, VersionedTypeSync,
  VersionedTypeAsync, SerializableTypeSync, SerializableTypeAsync
} from "./interfaces";
import {UnexpectedTypeError, ViaTypeError} from "./helpers/via-type-error";


const NAME = "string";

export interface StringOptions {
  regex?: RegExp;
  lowerCase?: boolean;
  trimmed?: boolean;
  minLength?: number;
  maxLength?: number;
}

const DEFAULT_OPTIONS: StringOptions = {
  regex: null,
  lowerCase: false,
  trimmed: false,
  minLength: null,
  maxLength: null,
};


function readSync(format: "json-doc" | "bson-doc", val: any, options: StringOptions): string {
  val = String(val);

  if (options.lowerCase) {
    val = val.toLowerCase();
  }

  if (options.trimmed) {
    val = _.trim(val);
  }

  let error = testErrorSync(val, options);
  if (error !== null) {
    throw error;
  }
  return val;
}

function readTrustedSync(format: "json-doc" | "bson-doc", val: any): string {
  return val;
}

function writeSync(format: "json-doc" | "bson-doc", val: string): string {
  return val;
}

function testErrorSync (val: any, options: StringOptions) {
  if (!(typeof val === "string")) {
    return new UnexpectedTypeError(typeof val, "string");
  }

  if (options.lowerCase) {
    if (val !== val.toLowerCase()){
      return new LowerCaseError(val);
    }
  }

  if (options.trimmed) {
    if (val !== _.trim(val)){
      return new TrimError(val);
    }
  }

  if (options.regex !== null) {
    if (!options.regex.test(val)) {
      return new PatternError(val, options.regex);
    }
  }

  let minLength = options.minLength;
  if (minLength !== null && val.length < minLength) {
    return new MinLengthError(val, minLength);
  }

  let maxLength = options.maxLength;
  if (maxLength !== null && val.length > maxLength) {
    return new MaxLengthError(val, maxLength);
  }

  return null;
}

function testSync (val: string, options: StringOptions): boolean {
  return testErrorSync(val, options) === null;
}

function equalsSync (val1: string, val2: string): boolean {
  return val1 === val2;
}

function cloneSync (val: string): string {
  return val;
}

function diffSync (oldVal: string, newVal: string): [string, string] {
  return oldVal === newVal ? null : [oldVal, newVal];
}

function patchSync (oldVal: string, diff: [string, string] | null): string {
  return diff === null ? oldVal : diff[1];
}

function reverseDiffSync (diff: [string, string] | null): [string, string] | null {
  return diff === null ? null : [diff[1], diff[0]];
}

function squashSync (diff1: [string, string] | null, diff2: [string, string] | null): [string, string] | null {
  if (diff1 === null) {
    return diff2 === null ? null : diff2;
  } else {
    return diff2 === null ? diff1 :  [diff1[0], diff2[1]];
  }
}

export class StringType implements
  SerializableTypeSync<string, "bson-doc", string>,
  VersionedTypeSync<string, string, [string, string]>,
  SerializableTypeAsync<string, "bson-doc", string>,
  VersionedTypeAsync<string, string, [string, string]> {

  isSync = true;
  isAsync = true;
  isSerializable = true;
  isVersioned = true;
  isCollection = false;
  type = NAME;
  types = [NAME];

  options: StringOptions = null;

  constructor(options?: StringOptions) {
    this.options = _.merge({}, DEFAULT_OPTIONS, options);
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: any): string {
    return readTrustedSync(format, val);
  }

  readTrustedAsync (format: "json-doc", val: string): Bluebird<string>;
  readTrustedAsync (format: "bson-doc", val: string): Bluebird<string>;
  readTrustedAsync (format: any, val: any): any {
    return Bluebird.try(() => readTrustedSync(format, val));
  }

  readSync (format: "json-doc" | "bson-doc", val: any): string {
    return readSync(format, val, this.options);
  }

  readAsync (format: "json-doc" | "bson-doc", val: any): Bluebird<string> {
    return Bluebird.try(() => readSync(format, val, this.options));
  }

  writeSync (format: "json-doc" | "bson-doc", val: string): any {
    return writeSync(format, val);
  }

  writeAsync (format: "json-doc" | "bson-doc", val: string): Bluebird<any> {
    return Bluebird.try(() => writeSync(format, val));
  }

  testErrorSync (val: any): Error | null {
    return testErrorSync(val, this.options);
  }

  testErrorAsync (val: any): Bluebird<Error | null> {
    return Bluebird.try(() => testErrorSync(val, this.options));
  }

  testSync (val: any): boolean {
    return testSync(val, this.options);
  }

  testAsync (val: any): Bluebird<boolean> {
    return Bluebird.try(() => testSync(val, this.options));
  }

  equalsSync (val1: string, val2: string): boolean {
    return equalsSync(val1, val2);
  }

  equalsAsync (val1: string, val2: string): Bluebird<boolean> {
    return Bluebird.try(() => equalsSync(val1, val2));
  }

  cloneSync (val: string): string {
    return cloneSync(val);
  }

  cloneAsync (val: string): Bluebird<string> {
    return Bluebird.try(() => cloneSync(val));
  }

  diffSync (oldVal: string, newVal: string): [string, string] | null {
    return diffSync(oldVal, newVal);
  }

  diffAsync (oldVal: string, newVal: string): Bluebird<[string, string] | null> {
    return Bluebird.try(() => diffSync(oldVal, newVal));
  }

  patchSync (oldVal: string, diff: [string, string] | null): string {
    return patchSync(oldVal, diff);
  }

  patchAsync (oldVal: string, diff: [string, string] | null): Bluebird<string> {
    return Bluebird.try(() => patchSync(oldVal, diff));
  }

  reverseDiffSync(diff: [string, string] | null): [string, string] | null {
    return reverseDiffSync(diff);
  }

  reverseDiffAsync(diff: [string, string] | null): Bluebird<[string, string] | null> {
    return Bluebird.try(() => reverseDiffSync(diff));
  }

  squashSync(diff1: [string, string] | null, diff2: [string, string] | null): [string, string] | null {
    return squashSync(diff1, diff2);
  }

  squashAsync(diff1: [string, string] | null, diff2: [string, string] | null): Bluebird<[string, string] | null> {
    return Bluebird.try(() => squashSync(diff1, diff2));
  }
}


export class StringTypeError extends ViaTypeError {}

export class LowerCaseError extends StringTypeError {
  constructor (string: string) {
    super (null, "CaseError", {string: string}, "Expected string to be lowercase")
  }
}

export class TrimError extends StringTypeError {
  constructor (string: string) {
    super (null, "TrimError", {string: string}, "Expected string to be trimmed")
  }
}

export class PatternError extends StringTypeError {
  constructor (string: string, pattern: RegExp) {
    super (null, "PatternError", {string: string, pattern: pattern}, `Expected string to follow pattern ${pattern}`);
  }
}

export class MinLengthError extends StringTypeError {
  constructor (string: string, minLength: number) {
    super (null, "MinLengthError", {string: string, minLength: minLength}, `Expected string length (${string.length}) to be greater than or equal to ${minLength}`);
  }
}

export class MaxLengthError extends StringTypeError {
  constructor (string: string, maxLength: number) {
    super (null, "MaxLengthError", {string: string, maxLength: maxLength}, `Expected string length (${string.length}) to be less than or equal to ${maxLength}`);
  }
}
