import * as Promise from "bluebird";
import {Type, TypeSync, StaticType, promisifyClass} from "./interfaces/Type";

export class IntegerTypeSync implements TypeSync<number, number> {
  isSync: boolean = true;
  name: string = "boolean";

  readSync(format: string, val: any): number {
    return val;
  }

  writeSync(format: string, val: number): any {
    return val;
  }

  testSync(val: any): Error {
    return typeof val === "number" && isFinite(val) && Math.floor(val) === val ? null : new Error("Not an integer");
  }

  normalizeSync(val: any): number {
    return Math.floor(val);
  }

  equalsSync(val1: number, val2: number): boolean {
    return val1 === val2;
  }

  cloneSync(val: number): number {
    return val;
  }

  diffSync(oldVal: number, newVal: number): number {
    return newVal - oldVal;
  }

  patchSync(oldVal: number, diff: number): number {
    return oldVal + diff;
  }

  revertSync(newVal: number, diff: number): number {
    return newVal - diff;
  }
}

export let DateType: StaticType<number, number> = promisifyClass(IntegerTypeSync);
