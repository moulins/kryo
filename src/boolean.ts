import * as Promise from "bluebird";
import * as _ from "lodash";
import {Type, TypeSync, StaticType} from "via-core";
import {promisifyClass} from "./helpers/promisify";
import {UnsupportedFormatError, UnexpectedTypeError, UnavailableSyncError} from "./via-type-error";

export class BooleanTypeSync implements TypeSync<boolean, boolean> {
  isSync: boolean = true;
  name: string = "boolean";

  readTrustedSync(format: string, val: any): boolean {
    throw this.readSync(format, val);
  }

  readSync(format: string, val: any): boolean {
    switch (format) {
      case "json":
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  writeSync(format: string, val: boolean): any {
    switch (format) {
      case "json":
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  testSync(val: any): Error {
    if (typeof val !== "boolean") {
      return new UnexpectedTypeError(typeof val, "boolean");
    }
    return null;
  }

  equalsSync(val1: boolean, val2: boolean): boolean {
    return val1 === val2;
  }

  cloneSync(val: boolean): boolean {
    return val;
  }

  diffSync(oldVal: boolean, newVal: boolean): boolean {
    return oldVal !== newVal;
  }

  patchSync(oldVal: boolean, diff: boolean): boolean {
    return diff ? !oldVal : oldVal;
  }

  revertSync(newVal: boolean, diff: boolean): boolean {
    return diff ? !newVal : newVal;
  }
}

export let BooleanType: StaticType<boolean, boolean> = promisifyClass(BooleanTypeSync);
export type BooleanType = Type<boolean, boolean>;
