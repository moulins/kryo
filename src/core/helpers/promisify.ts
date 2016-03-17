import * as Promise from "bluebird";
import {Type, TypeSync, CollectionType, CollectionTypeAsync, CollectionTypeSync} from "via-core";
import {StaticType, StaticTypeSync} from "./class-interfaces";

export function promisify<T, D>(typeSync: TypeSync<T, D>): Type<T, D> {
  let type: Type<T, D> = <any> typeSync;
  type.isSync = true;

  if (!type.read) {
    type.read = function(format: string, val: any): Promise<T> {
      return Promise.try(<() => T> this.readSync, [format, val], this);
    };
  }

  if (!type.write) {
    type.write = function(format: string, val: T): Promise<any> {
      return Promise.try(<() => any> this.writeSync, [format, val], this);
    };
  }

  if (!type.test) {
    type.test = function(val: any): Promise<Error> {
      return Promise.try(<() => Error> this.testSync, [val], this);
    };
  }

  if (!type.normalize) {
    type.normalize = function(val: any): Promise<T> {
      return Promise.try(<() => T> this.normalizeSync, [val], this);
    };
  }

  if (!type.equals) {
    type.equals = function(val1: T, val2: T): Promise<boolean> {
      return Promise.try(<() => boolean> this.equalsSync, [val1, val2], this);
    };
  }

  if (!type.clone) {
    type.clone = function(val: T): Promise<T> {
      return Promise.try(<() => T> this.cloneSync, [val], this);
    };
  }

  if (!type.diff) {
    type.diff = function(oldVal: T, newVal: T): Promise<D> {
      return Promise.try(<() => D> this.diffSync, [oldVal, newVal], this);
    };
  }

  if (!type.patch) {
    type.patch = function(oldVal: T, diff: D): Promise<T> {
      return Promise.try(<() => T> this.patchSync, [oldVal, diff], this);
    };
  }

  if (!type.revert) {
    type.revert = function(newVal: T, diff: D): Promise<T> {
      return Promise.try(<() => T> this.revertSync, [newVal, diff], this);
    };
  }

  return type;
}

export function promisifyClass<T, D>(typeSync: StaticTypeSync<T, D>): StaticType<T, D> {
  promisify(typeSync.prototype);
  return <StaticType<T, D>> <any> typeSync;
}
