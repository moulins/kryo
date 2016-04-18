import * as Bluebird from "bluebird";
import {type} from "via-core";
import {StaticType, StaticTypeSync} from "./class-interfaces";

export function promisify<T, D>(typeSync: type.TypeSync<T, D>): type.Type<T, D> {
  let type: type.Type<T, D> = <any> typeSync;
  type.isSync = true;

  if (!type.readTrusted) {
    type.readTrusted = function(val: any): Bluebird<T> {
      return Bluebird.try(() => {return this.readTrustedSync(val);});
    };
  }
  
  if (!type.read) {
    type.read = function(format: string, val: any): Bluebird<T> {
      return (<Function> Bluebird.try)(this.readSync, [format, val], this);
    };
  }

  if (!type.write) {
    type.write = function(format: string, val: T): Bluebird<any> {
      return Bluebird.try(() => {return this.writeSync(format, val);});
    };
  }

  if (!type.test) {
    type.test = function(val: any): Bluebird<Error> {
      return Bluebird.try(() => {return this.testSync(val);});
    };
  }

  if (!type.equals) {
    type.equals = function(val1: T, val2: T): Bluebird<boolean> {
      return Bluebird.try(() => {return this.equalsSync(val1, val2);});
    };
  }

  if (!type.clone) {
    type.clone = function(val: T): Bluebird<T> {
      return Bluebird.try(() => {return this.cloneSync(val);});
    };
  }

  if (!type.diff) {
    type.diff = function(oldVal: T, newVal: T): Bluebird<D> {
      return Bluebird.try(() => {return this.diffSync(oldVal, newVal);});
    };
  }

  if (!type.patch) {
    type.patch = function(oldVal: T, diff: D): Bluebird<T> {
      return Bluebird.try(() => {return this.patchSync(oldVal, diff);});
    };
  }

  if (!type.revert) {
    type.revert = function(newVal: T, diff: D): Bluebird<T> {
      return Bluebird.try(() => {return this.revertSync(newVal, diff);});
    };
  }

  return type;
}

export function promisifyClass<T, D>(typeSync: StaticTypeSync<T, D>): StaticType<T, D> {
  promisify(typeSync.prototype);
  return <StaticType<T, D>> <any> typeSync;
}
