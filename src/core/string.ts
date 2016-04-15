import * as Promise from "bluebird";
import * as _ from "lodash";
import {Type, TypeSync, StaticType} from "via-core";
import {promisifyClass} from "./helpers/promisify";

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

  readSync(format: string, val: any): string {
    switch (format) {
      case "json":
      case "bson":
        return String(val);
      default:
        throw new Error("Unsupported format");
    }
  }

  writeSync(format: string, val: string): any {
    switch (format) {
      case "json":
      case "bson":
        return String(val);
      default:
        throw new Error("Unsupported format");
    }
  }

  testSync(val: any, opt?: StringOptions): Error {
    let options: StringOptions = StringTypeSync.mergeOptions(this.options, opt);

    if (!(typeof val === "string")) {
      return new Error("Expected string");
    }

    // if (options.looseTest) {
    //   return null;
    // }

    if (options.lowerCase) {
      if (val !== val.toLowerCase()){
        return new Error("Expected lower case string.");
      }
    }

    if (options.trimmed) {
      if (val !== _.trim(val)){
        return new Error("Expected trimmed string.");
      }
    }

    if (options.regex !== null) {
      if (!this.options.regex.test(val)) {
        return new Error("Expected string to match pattern");
      }
    }

    let minLength = options.minLength;
    if (minLength !== null && val.length < minLength) {
      return new Error("Expected string longer than "+minLength+".");
    }

    let maxLength = options.maxLength;
    if (maxLength !== null && val.length > maxLength) {
      return new Error("Expected string shorter than "+maxLength+".");
    }

    return null;
  }

  normalizeSync(val: any): string {
    return String(val);
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
