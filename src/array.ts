import {
  VersionedCollectionTypeSync, VersionedCollectionTypeAsync, TypeSync,
  TypeAsync, Type,
  Dictionary, NumericDictionary, SerializableTypeSync, SerializableTypeAsync,
  VersionedTypeAsync, VersionedTypeSync, TypeBase
} from "./interfaces";
import * as Bluebird from "bluebird";
import * as _ from "lodash";

import {UnexpectedTypeError} from "./helpers/via-type-error";
import {Incident} from "incident";


const NAME = "array";


export interface ArrayOptions<TypeKind> {
  maxLength: number;
  itemType: TypeKind;
}

export interface ArrayDiff {
  append?: any[];
  pop?: any[];
  prepend?: any[];
  shift?: any[];
}

let defaultOptions: ArrayOptions<TypeBase> = {
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
    super('max-length', {array: array, maxLength: maxLength}, "Error with maxlength");
  }
}
export class InvalidItemsError extends Incident {
  constructor(errors: NumericDictionary<Error>) {
    //noinspection TypeScriptValidateTypes
    super('invalid-items', {items: errors}, 'There are some invalid items');
  }
}


// Serializable


function writeSync<I, S> (
  format: "json-doc",
  val: I[],
  options: ArrayOptions<SerializableTypeSync<"json-doc", I, S>>
): S[];
function writeSync<I, S> (
  format: "bson-doc",
  val: I[],
  options: ArrayOptions<SerializableTypeSync<"bson-doc", I, S>>
): S[];
function writeSync<I, S> (format: any, val: any, options: any): any {
  return _.map(val, item => options.itemType.writeSync(format, item));
}


function writeAsync<I, S> (
  format: "json-doc",
  val: I[],
  options: ArrayOptions<SerializableTypeSync<"json-doc", I, S>>
): Bluebird<S[]>;
function writeAsync<I, S> (
  format: "bson-doc",
  val: I[],
  options: ArrayOptions<SerializableTypeSync<"bson-doc", I, S>>
): Bluebird<S[]>;
function writeAsync<I, S> (format: any, val: any, options: any): any {
  return Bluebird.map(val, item => options.itemType.writeAsync(format, item));
}


function readTrustedSync<I, S> (
  format: "json-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"json-doc", I, S>>
): I[];
function readTrustedSync<I, S> (
  format: "bson-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"bson-doc", I, S>>
): I[];
function readTrustedSync<I, S> (format: any, val: any, options: any): any {
  return _.map(val, item => options.itemType.readTrustedSync(format, item));
}


function readTrustedAsync<I, S> (
  format: "json-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"json-doc", I, S>>
): Bluebird<I[]>;
function readTrustedAsync<I, S> (
  format: "bson-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"bson-doc", I, S>>
): Bluebird<I[]>;
function readTrustedAsync<I, S> (format: any, val: any, options: any): any {
  return Bluebird.map(val, item => options.itemType.readTrustedAsync(format, item));
}


function readSync<I, S> (
  format: "json-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"json-doc", I, S>>
): I[];
function readSync<I, S> (
  format: "bson-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"bson-doc", I, S>>
): I[];
function readSync<I, S> (format: any, val: any, options: any): any {
  if (!Array.isArray(val)) {
    throw new Incident("Not an array");
  }
  return _.map(val, item => options.itemType.readSync(format, item));
}


function readAsync<I, S> (
  format: "json-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"json-doc", I, S>>
): Bluebird<I[]>;
function readAsync<I, S> (
  format: "bson-doc",
  val: S[],
  options: ArrayOptions<SerializableTypeSync<"bson-doc", I, S>>
): Bluebird<I[]>;
function readAsync<I, S> (format: any, val: any, options: any): any {
  if (!Array.isArray(val)) {
    return Bluebird.reject(new Incident("Not an array"));
  }
  return Bluebird.map(val, item => options.itemType.readAsync(format, item));
}


export class ArrayType<I> implements
  SerializableTypeSync<"json-doc", I[], any[]>,
  SerializableTypeSync<"bson-doc", I[], any[]>,
  VersionedTypeSync<I[], ArrayDiff>,
  SerializableTypeAsync<"json-doc", I[], any[]>,
  SerializableTypeAsync<"bson-doc", I[], any[]>,
  VersionedTypeAsync<I[], ArrayDiff> {

  isSync = true;
  isAsync = true;
  isSerializable = true;
  isVersioned = true;
  isCollection = true;
  type = NAME;
  types = [NAME];

  options: ArrayOptions<TypeBase> = null;

  constructor(options: ArrayOptions<TypeBase>) {
    this.options = _.merge({}, defaultOptions, options);
    this.isSync = options.itemType.isSync;
    this.isAsync = options.itemType.isAsync;
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  writeSync<S> (format: "json-doc", val: I[]): S[];
  writeSync<S> (format: "bson-doc", val: I[]): S[];
  writeSync<S> (format: any, val: any): any {
    if (!this.isSync) {
      throw new TemporalError();
    }
    return writeSync(format, val, <any> this.options);
  }

  writeAsync<S> (format: "json-doc", val: I[]): Bluebird<S[]>;
  writeAsync<S> (format: "bson-doc", val: I[]): Bluebird<S[]>;
  writeAsync<S> (format: any, val: any): any {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return writeAsync(format, val, <any> this.options);
  }

  readTrustedSync<S> (format: "json-doc", val: S[]): I[];
  readTrustedSync<S> (format: "bson-doc", val: S[]): I[];
  readTrustedSync<S> (format: any, val: any): any {
    if (!this.isSync) {
      throw new TemporalError();
    }
    return readTrustedSync(format, val, <any> this.options);
  }

  readTrustedAsync<S> (format: "json-doc", val: S[]): Bluebird<I[]>;
  readTrustedAsync<S> (format: "bson-doc", val: S[]): Bluebird<I[]>;
  readTrustedAsync<S> (format: any, val: any): any {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return readTrustedAsync(format, val, <any> this.options);
  }

  readSync (format: "json-doc", val: any[]): I[];
  readSync (format: "bson-doc", val: any[]): I[];
  readSync (format: any, val: any): any {
    if (!this.isSync) {
      throw new TemporalError();
    }
    return readSync(format, val, <any> this.options);
  }

  readAsync (format: "json-doc", val: any[]): Bluebird<I[]>;
  readAsync (format: "bson-doc", val: any[]): Bluebird<I[]>;
  readAsync (format: any, val: any): any {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return readAsync(format, val, <any> this.options);
  }

  testErrorSync (val: I[]): Error | null {
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

  testErrorAsync (val: I[]): Bluebird<Error | null> {
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

  testSync (val: I[]): boolean {
    return this.testErrorSync(val) === null;
  }

  testAsync (val: I[]): Bluebird<boolean> {
    return this.testErrorAsync(val).then(res => res === null);
  }

  equalsSync (val1: I[], val2: I[]): boolean {
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

  equalsAsync (val1: I[], val2: I[]): Bluebird<boolean> {
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

  cloneSync (val: I[]): I[] {
    if (!this.isSync) {
      throw new TemporalError();
    }
    let itemType: TypeSync<any> = <any> this.options.itemType;
    return _.map(val, item => itemType.cloneSync(val));
  }

  cloneAsync (val: I[]): Bluebird<I[]> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    let itemType: TypeAsync<any> = <any> this.options.itemType;
    return Bluebird.map(val, (item) => itemType.cloneAsync(item));
  }

  diffSync (oldVal: I[], newVal: I[]): ArrayDiff | null {
    if (!this.isSync) {
      throw new TemporalError();
    }
    throw new Error("Not implemented");
  }

  diffAsync (oldVal: I[], newVal: I[]): Bluebird<ArrayDiff | null> {
    if (!this.isAsync) {
      return Bluebird.reject(new TemporalError());
    }
    return Bluebird.reject(new Error("Not implemented"));
  }

  patchSync (oldVal: I[], diff: ArrayDiff | null): I[] {
    if (!this.isSync) {
      throw new TemporalError();
    }
    throw new Error("Not implemented");
  }

  patchAsync (oldVal: I[], diff: ArrayDiff | null): Bluebird<I[]> {
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
