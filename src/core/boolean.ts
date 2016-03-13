import * as Promise from "bluebird";
import {Type, TypeSync, StaticType, promisifyClass} from "./interfaces/type";

export class BooleanTypeSync implements TypeSync<boolean, boolean> {
  isSync: boolean = true;
  name: string = "boolean";

  readSync(format: string, val: any): boolean {
    return Boolean(val);
  }

  writeSync(format: string, val: boolean): any {
    return Boolean(val);
  }

  testSync(val: any): Error {
    if (typeof val !== "boolean") {
      return new Error('Expected typeof val to be "boolean"');
    }
    return null;
  }

  normalizeSync(val: boolean): boolean {
    return Boolean(val);
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
