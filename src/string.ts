import * as _ from "lodash";
import {TypeSync, StaticType} from "via-core";
import {promisifyClass} from "./helpers/promisify";
import {UnsupportedFormatError, UnexpectedTypeError, ViaTypeError} from "./via-type-error";

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

export interface StringOptions {
  regex?: RegExp;
  lowerCase?: boolean;
  trimmed?: boolean;
  minLength?: number;
  maxLength?: number;

  looseTest?: boolean;
}

let defaultOptions: StringOptions = {
  regex: null,
  lowerCase: false,
  trimmed: false,
  minLength: null,
  maxLength: null,

  looseTest: false
};

export class StringTypeSync implements TypeSync<string, string[]> {
  isSync: boolean = true;
  name: string = "string";
  options: StringOptions;

  constructor (options?: StringOptions) {
    this.options = _.assign(_.clone(defaultOptions), options);
  }

  readTrustedSync(format: string, val: any): string {
    throw this.readSync(format, val);
  }

  readSync(format: string, val: any): string {
    switch (format) {
      case "json":
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  writeSync(format: string, val: string): any {
    switch (format) {
      case "json":
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  testSync(val: any, opt?: StringOptions): Error {
    let options: StringOptions = StringTypeSync.mergeOptions(this.options, opt);

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

  equalsSync(val1: string, val2: string): boolean {
    return val1 === val2;
  }

  cloneSync(val: string): string {
    return val;
  }

  diffSync(oldVal: string, newVal: string): string[] {
    return [oldVal, newVal];
  }

  patchSync(oldVal: string, diff: string[]): string {
    return diff[1];
  }

  revertSync(newVal: string, diff: string[]): string {
    return diff[0];
  }

  static assignOptions (target: StringOptions, source: StringOptions): StringOptions {
    if (!source) {
      return target || {};
    }
    _.assign(target, source);
    return target;
  }

  static cloneOptions (source: StringOptions): StringOptions {
    return StringTypeSync.assignOptions({}, source);
  }

  static mergeOptions (target: StringOptions, source: StringOptions): StringOptions {
    return StringTypeSync.assignOptions(StringTypeSync.cloneOptions(target), source);
  }
}

export let StringType: StaticType<string, string[]> = promisifyClass(StringTypeSync);
