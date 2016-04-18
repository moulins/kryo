import * as Promise from "bluebird";
import * as _ from "lodash";
import {type} from "via-core";
import {promisifyClass} from "./helpers/promisify";
import {UnsupportedFormatError, UnexpectedTypeError, UnavailableSyncError} from "./helpers/via-type-error";

export class BooleanTypeSync implements type.TypeSync<boolean, boolean> {
  isSync: boolean = true;
  name: string = "boolean";

  readTrustedSync(format: string, val: any): boolean {
    switch (format) {
      case "json":
      case "bson":
        return val;
      default:
        throw new UnsupportedFormatError(format);
    }
  }

  readSync(format: string, val: any): boolean {
    let res = this.readTrustedSync(format, val);
    let err = this.testSync(res);
    if (err !== null) {
      throw err;
    }
    return res;
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

export let BooleanType: type.StaticType<boolean, boolean> = promisifyClass(BooleanTypeSync);
export type BooleanType = type.Type<boolean, boolean>;
