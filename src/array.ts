import {
  VersionedCollectionTypeSync, VersionedCollectionTypeAsync, TypeSync,
  TypeAsync, Type,
  Dictionary, NumericDictionary
} from "./interfaces";
import * as Bluebird from "bluebird";
import * as _ from "lodash";

import {UnexpectedTypeError} from "./helpers/via-type-error";
import {Incident} from "incident";


const NAME = "array";


export interface ArrayOptions {
  maxLength: number;
  itemType: Type<any>;
}

export interface ArrayDiff {
  append?: any[];
  pop?: any[];
  prepend?: any[];
  shift?: any[];
}

let defaultOptions: ArrayOptions = {
  maxLength: 100,
  itemType: null
};

export class TemporalError extends Incident {
  constructor() {
    //noinspection TypeScriptValidateTypes
    super('temporal', "Invalid temporality (sync mixed with async)");
  }
}
export class MaxLengthError extends Incident {
  constructor(array: any[], maxLength: number) {
    //noinspection TypeScriptValidateTypes
    super('max-length', {array: array, maxLength: maxLength}, "Error with maxlength")
  }
}
export class InvalidItemsError extends Incident {
  constructor(errors: NumericDictionary<Error>) {
    //noinspection TypeScriptValidateTypes
    super('invalid-items', {items: errors}, 'There are some invalid items');
  }
}

export class ArrayType<I> implements
  VersionedCollectionTypeSync<I[], ArrayDiff, I>,
  VersionedCollectionTypeAsync<I[], ArrayDiff, I> {

  isSync = true;
  isAsync = true;
  isCollection = true;
  type = NAME;
  types = [NAME];

  options: ArrayOptions = null;

  constructor(options: ArrayOptions) {
    this.options = _.merge({}, defaultOptions, options);
    this.isSync = options.itemType.isSync;
    this.isAsync = options.itemType.isAsync;
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc" | "bson-doc", val: any[]): any[] {
    if (!this.isSync) {
      throw new TemporalError();
    }
    let itemType: TypeSync<any> = <any> this.options.itemType;
    return _.map(val, item => itemType.readTrustedSync(format, item));
  }

  readTrustedAsync (format: "json-doc" | "bson-doc", val: any[]): Bluebird<any[]> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    let itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.map(val, item => itemType.readAsync(format, item));
  }

  readSync (format: "json-doc" | "bson-doc", val: any[]): any[] {
    if (!this.isSync) {
      throw new TemporalError();
    }
    let itemType: TypeSync<any> = <any> this.options.itemType;
    if (!Array.isArray(val)) {
      throw new Incident("Not an array");
    }
    return _.map(val, item => itemType.readSync(format, item));
  }

  readAsync (format: "json-doc" | "bson-doc", val: any[]): Bluebird<any[]> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    let itemType: TypeAsync<any> = <any> this.options.itemType;
    if (!Array.isArray(val)) {
      throw new Incident("Not an array");
    }
    return Bluebird.map(val, item => itemType.readAsync(format, item));
  }

  writeSync (format: "json-doc" | "bson-doc", val: any[]): any[] {
    if (!this.isSync) {
      throw new TemporalError();
    }
    let itemType: TypeSync<any> = <any> this.options.itemType;
    return _.map(val, item => itemType.writeSync(format, item));
  }

  writeAsync (format: "json-doc" | "bson-doc", val: any[]): Bluebird<any[]> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    let itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.map(val, item => itemType.writeAsync(format, item));
  }

  testErrorSync (val: any[]): Error | null {
    if (!this.isSync) {
      throw new TemporalError();
    }
    let itemType: TypeSync<any> = <any> this.options.itemType;
    if (!_.isArray(val)) {
      return new UnexpectedTypeError(typeof val, "array");
    }
    if (this.options.maxLength !== null && val.length > this.options.maxLength) {
      return new MaxLengthError(val, this.options.maxLength);
    }

    const mapped = _.map(val, item => itemType.testErrorSync(item));
    const errors = _.reduce(
      mapped,
      (memo: null | NumericDictionary<Error>, current: Error | null, idx: number) => {
        if (current === null) {
          return memo;
        }
        if (memo === null) {
          memo = {};
        }
        memo[idx] = current;
        return memo
      },
      null
    );
    if (errors !== null) {
      return new InvalidItemsError(errors); // TODO
    }
    return null;
  }

  testErrorAsync (val: any[]): Bluebird<Error | null> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    let itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.try(() => {
      if (!_.isArray(val)) {
        return new UnexpectedTypeError(typeof val, "array");
      }

      if (this.options.maxLength !== null && val.length > this.options.maxLength) {
        return new MaxLengthError(val, this.options.maxLength);
      }

      if (this.options.itemType === null) { // manually managed type
        return null;
      }

      return Bluebird.resolve(val)
        .map(item => itemType.testErrorAsync(item))
        .reduce((memo: null | NumericDictionary<Error>, current: Error | null, idx: number) => {
          if (current === null) {
            return memo;
          }
          if (memo === null) {
            memo = {};
          }
          memo[idx] = current;
          return memo
        }, null)
        .then((errors) => {
          if (errors !== null) {
            return new InvalidItemsError(errors); // TODO
          }
          return null;
        });
    });
  }

  testSync (val: any[]): boolean {
    return this.testErrorSync(val) === null;
  }

  testAsync (val: any[]): Bluebird<boolean> {
    return this.testErrorAsync(val).then(res => res === null);
  }

  equalsSync (val1: any[], val2: any[]): boolean {
    if (!this.isSync) {
      throw new TemporalError();
    }
    let itemType: TypeSync<any> = <any> this.options.itemType;
    if (val1.length !== val2.length) {
      return false;
    }
    const mapped = _.map(val1, (item, idx) => itemType.equalsSync(item, val2[idx]));
    return _.reduce(mapped, (memo: boolean, current: boolean) => memo && current, true);
  }

  equalsAsync (val1: any[], val2: any[]): Bluebird<boolean> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    let itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.try(() => {
      if (val1.length !== val2.length) {
        return false;
      }
      return Bluebird.resolve(val1)
        .map((item, idx) => {
          return itemType.equalsAsync(item, val2[idx]);
        })
        .reduce((memo: boolean, current: boolean) => memo && current, true);
    });
  }

  cloneSync (val: any[]): any[] {
    if (!this.isSync) {
      throw new TemporalError();
    }
    let itemType: TypeSync<any> = <any> this.options.itemType;
    return _.map(val, item => itemType.cloneSync(val));
  }

  cloneAsync (val: any[]): Bluebird<any[]> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    let itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.map(val, (item) => itemType.cloneAsync(item));
  }

  diffSync (oldVal: any[], newVal: any[]): ArrayDiff | null {
    if (!this.isSync) {
      throw new TemporalError();
    }
    throw new Error("Not implemented");
  }

  diffAsync (oldVal: any[], newVal: any[]): Bluebird<ArrayDiff | null> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  patchSync (oldVal: any[], diff: ArrayDiff | null): any[] {
    if (!this.isSync) {
      throw new TemporalError();
    }
    throw new Error("Not implemented");
  }

  patchAsync (oldVal: any[], diff: ArrayDiff | null): Bluebird<any[]> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  reverseDiffSync(diff: ArrayDiff | null): ArrayDiff | null {
    if (!this.isSync) {
      throw new TemporalError();
    }
    throw new Error("Not implemented");
  }

  reverseDiffAsync(diff: ArrayDiff | null): Bluebird<ArrayDiff | null> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  squashSync(diff1: ArrayDiff | null, diff2: ArrayDiff | null): ArrayDiff | null {
    if (!this.isSync) {
      throw new TemporalError();
    }
    throw new Error("Not implemented");
  }

  squashAsync(diff1: ArrayDiff | null, diff2: ArrayDiff | null): Bluebird<ArrayDiff | null> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  //noinspection TypeScriptUnresolvedVariable
  iterateAsync (value: any[]): IteratorResult<PromiseLike<I>> {
    throw new Error("TODO");
  }

  //noinspection TypeScriptUnresolvedVariable
  iterateSync (value: any[]): IteratorResult<I> {
    throw new Error("TODO");
  }
}

  //
  // reflect (visitor: (value?: any, key?: string, parent?: type.CollectionType<any, any>) => any) {
  //   return Bluebird.try(() => {
  //     let options: ArrayOptions = this.options;
  //
  //     visitor(options.itemType, null, <type.CollectionType<any, any>> this);
  //     if ((<type.CollectionType<any, any>> options.itemType).reflect) {
  //       (<type.CollectionType<any, any>> options.itemType).reflect(visitor);
  //     }
  //   });
  // }
  //
  // diffToUpdate (newVal: any, diff: any, format: string): Bluebird<type.UpdateQuery> {
  //   let update: type.UpdateQuery = {
  //     $set: {},
  //     $unset: {}
  //   };
  //
  //   return Bluebird.resolve(update);
  // }
  //
