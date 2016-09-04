import * as Bluebird from "bluebird";
import * as _ from "lodash";

import {
  Document, VersionedTypeSync, VersionedTypeAsync,
  Dictionary, TypeSync, VersionedCollectionTypeSync,
  VersionedCollectionTypeAsync, Type, SerializableTypeSync,
  SerializableTypeAsync
} from "./interfaces";
import {ViaTypeError} from "./helpers/via-type-error";
import {error} from "util";
import {TemporalError} from "./array";

export class InvalidTimestampError extends ViaTypeError {
  constructor(date: Date) {
    super('invalid-timestamp', {date: date}, 'Invalid timestamp');
  }
}

const NAME = "document";


// Configuration interfaces

export interface DocumentOptions<TypeKind> {
  ignoreExtraKeys?: boolean;
  properties: Dictionary<PropertyDescriptor<TypeKind>>;
}

export interface DocumentOptionsFull<TypeKind> extends DocumentOptions<TypeKind> {
  ignoreExtraKeys: boolean;
}

export interface PropertyDescriptor<TypeKind> {
  /// This property can be missing
  optional?: boolean;
  /// The value can be `null`
  nullable?: boolean;
  type: TypeKind;
}

export interface PropertyDescriptorFull<TypeKind> extends PropertyDescriptor<TypeKind> {
  /// This property can be missing
  optional: boolean;
  /// The value can be `null`
  nullable: boolean;
}

// End of configuration interfaces

export interface DocumentDiff {
  set: Document; // val
  update: Dictionary<any>; // diff
  unset: Document; // val
  toNull: Document;
  fromNull: Document;
}

export interface DiffKeysResult {
  commonKeys: string[];
  missingKeys: string[];
  extraKeys: string[];
}

function diffKeys(source: Document, target: Document): DiffKeysResult {
  const sourcetKeys: string[] = _.keys(source);
  const targetKeys: string[] = _.keys(target);

  return {
    commonKeys: _.intersection(sourcetKeys, targetKeys),
    missingKeys: _.difference(sourcetKeys, targetKeys),
    extraKeys: _.difference(targetKeys, sourcetKeys)
  }
}

export class DocumentType implements
  SerializableTypeSync<Document, "bson-doc", Document>,
  VersionedTypeSync<Document, Document, DocumentDiff>,
  SerializableTypeAsync<Document, "bson-doc", Document>,
  VersionedTypeAsync<Document, Document, DocumentDiff> {

  isSync = true;
  isAsync = true;
  isSerializable = true;
  isVersioned = true;
  isCollection = true;
  type = NAME;
  types = [NAME];

  options: DocumentOptionsFull<any> = null;

  constructor(options: DocumentOptions<Type<any>>) {
    let properties: Dictionary<PropertyDescriptorFull<any>> = {};
    for (const key in options.properties) {
      properties[key] = {
        optional: "optional" in options.properties[key] ? options.properties[key].optional : false,
        nullable: "nullable" in options.properties[key] ? options.properties[key].nullable : false,
        type: options.properties[key].type
      };
    }
    this.options = {
      ignoreExtraKeys: true,
      properties: properties
    };

    this.isSync = _.reduce(options.properties, (memo, curProperty) => memo && curProperty.type.isSync, true);
    this.isAsync = _.reduce(options.properties, (memo, curProperty) => memo && curProperty.type.isAsync, true);
  }

  toJSON(): null { // TODO: return options
    return null;
  }

  readTrustedSync (format: "json-doc", val: Document): Document;
  readTrustedSync (format: "bson-doc", val: Document): Document;
  readTrustedSync (format: any, val: any): any {
    return readTrustedSync(format, val, this.options);
  }

  readTrustedAsync (format: "json-doc" | "bson-doc", val: Document): Bluebird<Document> {
    return Bluebird.reject(new TemporalError());
  }

  readSync (format: "json-doc", val: Document): Document;
  readSync (format: "bson-doc", val: Document): Document;
  readSync (format: any, val: any): any {
    return readSync(format, val, this.options);
  }

  readAsync (format: "json-doc" | "bson-doc", val: Document): Bluebird<Document> {
    return Bluebird.reject(new TemporalError());
  }

  writeSync (format: "json-doc", val: Document): Document;
  writeSync (format: "bson-doc", val: Document): Document;
  writeSync (format: any, val: any): any {
    return writeSync(format, val, this.options);
  }

  writeAsync (format: "json-doc" | "bson-doc", val: Document): Bluebird<Document> {
    return Bluebird.reject(new TemporalError());
  }

  testErrorSync (val: Document): Error | null {
    return testErrorSync(val, this.options);
  }

  testErrorAsync (val: Document): Bluebird<Error | null> {
    return Bluebird.reject(new TemporalError());
  }

  testSync (val: Document): boolean {
    return testSync(val, this.options);
  }

  testAsync (val: Document): Bluebird<boolean> {
    return Bluebird.reject(new TemporalError());
  }

  equalsSync (val1: Document, val2: Document): boolean {
    return equalsSync(val1, val2, this.options);
  }

  equalsAsync (val1: Document, val2: Document): Bluebird<boolean> {
    return Bluebird.reject(new TemporalError());
  }

  cloneSync (val: Document): Document {
    return cloneSync(val, this.options);
  }

  cloneAsync (val: Document): Bluebird<Document> {
    return Bluebird.reject(new TemporalError());
  }

  diffSync (oldVal: Document, newVal: Document): DocumentDiff | null {
    return diffSync(oldVal, newVal, this.options);
  }

  diffAsync (oldVal: Document, newVal: Document): Bluebird<DocumentDiff | null> {
    return Bluebird.reject(new TemporalError());
  }

  patchSync (oldVal: Document, diff: DocumentDiff | null): Document {
    return patchSync(oldVal, diff, this.options);
  }

  patchAsync (oldVal: Document, diff: DocumentDiff | null): Bluebird<Document> {
    return Bluebird.reject(new TemporalError());
  }

  reverseDiffSync(diff: DocumentDiff | null): DocumentDiff | null {
    return reverseDiffSync(diff, this.options);
  }

  reverseDiffAsync(diff: DocumentDiff | null): Bluebird<DocumentDiff | null> {
    return Bluebird.reject(new TemporalError());
  }

  //noinspection TypeScriptUnresolvedVariable
  iterateSync (value: Document): IteratorResult<any> {
    throw new Error("TODO");
  }

  //noinspection TypeScriptUnresolvedVariable
  iterateAsync (value: Document): IteratorResult<PromiseLike<any>> {
    throw new TemporalError();
  }
}

function readSync (
  format: "json-doc",
  val: Document,
  options: DocumentOptionsFull<SerializableTypeSync<"json-doc", any, any>>
): Bluebird<Document>;
function readSync (
  format: "bson-doc",
  val: Document,
  options: DocumentOptionsFull<SerializableTypeSync<"bson-doc", any, any>>
): Bluebird<Document>;
function readSync (format: any, val: any, options: any): any {
  const keysDiff = diffKeys(options.properties, val);

  const missingMandatoryKeys = _.filter(keysDiff.missingKeys, (key) => {
    return !options.properties[key].optional;
  });

  if (missingMandatoryKeys.length > 0) {
    throw new MissingKeysError(missingMandatoryKeys);
  } else if (keysDiff.extraKeys.length > 0 && options.ignoreExtraKeys) {
    throw new ExtraKeysError(keysDiff.extraKeys);
  }

  let result: Document = {};

  for (const key of keysDiff.commonKeys) {
    const member: any = val[key];
    const descriptor = options.properties[key];
    if (member === null) {
      if (!descriptor.nullable) {
        throw new ForbiddenNullError(key);
      }
      result[key] = null;
    } else {
      result[key] = descriptor.type.readSync(format, member);
    }
  }

  return result;
}

function readTrustedSync (
  format: "json-doc",
  val: Document,
  options: DocumentOptionsFull<SerializableTypeSync<"json-doc", any, any>>
): Bluebird<Document>;
function readTrustedSync (
  format: "bson-doc",
  val: Document,
  options: DocumentOptionsFull<SerializableTypeSync<"bson-doc", any, any>>
): Bluebird<Document>;
function readTrustedSync (format: any, val: any, options: any): any {
  const keysDiff = diffKeys(options.properties, val);

  let result: Document = {};

  for (const key of keysDiff.commonKeys) {
    const member: any = val[key];
    const descriptor = options.properties[key];
    if (member === null) {
      result[key] = null;
    } else {
      result[key] = descriptor.type.readSync(format, member);
    }
  }

  return result;
}

function writeSync (
  format: "json-doc",
  val: Document,
  options: DocumentOptionsFull<SerializableTypeSync<"json-doc", any, any>>
): Bluebird<Document>;
function writeSync (
  format: "bson-doc",
  val: Document,
  options: DocumentOptionsFull<SerializableTypeSync<"bson-doc", any, any>>
): Bluebird<Document>;
function writeSync (format: any, val: any, options: any): any {
  const keysDiff = diffKeys(options.properties, val);

  let result: Document = {};

  for (const key of keysDiff.commonKeys) {
    const member: any = val[key];
    const descriptor = options.properties[key];
    if (member === null) {
      result[key] = null;
    } else {
      result[key] = descriptor.type.writeSync(format, member);
    }
  }

  return result;
}

function testErrorSync (val: Document, options: DocumentOptionsFull<TypeSync<any>>): Error | null {
  if (typeof val !== "object") {
    return new Error("Unexpected type");
  }

  const keysDiff = diffKeys(options.properties, val);

  const missingMandatoryKeys = _.filter(keysDiff.missingKeys, (key) => {
    return !options.properties[key].optional;
  });

  if (missingMandatoryKeys.length > 0) {
    return new MissingKeysError(missingMandatoryKeys);
  } else if (keysDiff.extraKeys.length > 0 && options.ignoreExtraKeys) {
    return new ExtraKeysError(keysDiff.extraKeys);
  }

  let errors: Dictionary<Error> | null = null;

  for (const key of keysDiff.commonKeys) {
    let curError: Error | null = null;
    const member: any = val[key];
    const descriptor: PropertyDescriptor<TypeSync<any>> = options.properties[key];

    if (member === null && !descriptor.nullable) {
      curError = new ForbiddenNullError(key);
    } else {
      curError = descriptor.type.testErrorSync(member);
    }

    if (curError !== null) {
      if (errors === null) {
        errors = {};
      }
      errors[key] = curError;
    }
  }

  if (errors !== null) {
    return new InvalidProperties(errors);
  }

  return null;
}

function testSync (val: Document, options: DocumentOptionsFull<TypeSync<any>>): boolean {
  return testErrorSync(val, options) === null;
}

function equalsSync (val1: Document, val2: Document, options: DocumentOptionsFull<TypeSync<any>>): boolean {
  const keys: string[] = _.keys(options.properties);
  const val1Keys: string[] = _.intersection(keys, (<any> _).keys(val1));
  const val2Keys: string[] = _.intersection(keys, (<any> _).keys(val2));
  const commonKeys: string[] = _.intersection(val1Keys, val2Keys);
  const extraKeys: string[] = _.difference(val1Keys, val2Keys);
  const missingKeys: string[] = _.difference(val2Keys, val1Keys);

  if (extraKeys.length > 0 || missingKeys.length > 0) {
    return false;
  }

  for (const key of commonKeys) {
    if (val1[key] === null || val2[key] === null) {
      if (val1[key] !== val2[key]) {
        return false;
      }
    } else if (!options.properties[key].type.equalsSync(val1[key], val2[key])) {
      return false;
    }
  }

  return true;
}

function cloneSync (val: Document, options: DocumentOptionsFull<TypeSync<any>>): Document {
  const keys: string[] = _.intersection(_.keys(options.properties), _.keys(val));

  let result: Document = {};

  for (const key of keys) {
    if (val[key] === null) {
      result[key] = null;
    } else {
      result[key] = options.properties[key].type.cloneSync(val[key]);
    }
  }

  return result;
}

function diffSync (
  oldVal: Document,
  newVal: Document,
  options: DocumentOptionsFull<VersionedTypeSync<any, any, any>>
): DocumentDiff | null {
  const keysDiff = diffKeys(oldVal, newVal);  // TODO: intersection with properties
  let result: DocumentDiff = {set: {}, unset: {}, update: {}, toNull: {}, fromNull: {}};
  let equal = (keysDiff.extraKeys.length === 0 && keysDiff.missingKeys.length === 0);
  for (const key of keysDiff.extraKeys) {
    if (newVal[key] === null) {
      result.set[key] = null;
    } else {
      result.set[key] = options.properties[key].type.writeSync("json-doc", newVal[key]);
    }
  }
  for (const key of keysDiff.missingKeys) {
    if (oldVal[key] === null) {
      result.unset[key] = null;
    } else {
      result.unset[key] = options.properties[key].type.writeSync("json-doc", oldVal[key]);
    }
  }
  for (const key of keysDiff.commonKeys) {
    if (oldVal[key] === null || newVal[key] === null) {
      if (oldVal[key] === null && newVal[key] !== null) {
        result.fromNull = options.properties[key].type.writeSync("json-doc", newVal[key]);
        equal = false;
      } else if(oldVal[key] !== null && newVal[key] === null) {
        result.toNull = options.properties[key].type.writeSync("json-doc", oldVal[key]);
        equal = false;
      }
    } else {
      const diff: any = options.properties[key].type.diffSync(oldVal[key], newVal[key]);
      if (diff !== null) {
        result.update[key] = diff;
        equal = false;
      }
    }
  }
  return equal ? null : result;
}

function patchSync (
  oldVal: Document,
  diff: DocumentDiff | null,
  options: DocumentOptionsFull<VersionedTypeSync<any, any, any>>
): Document {
  let newVal: Document = cloneSync(oldVal, options);

  if (diff === null) {
    return newVal;
  }

  for (const key in diff.set) {
    if (diff.set[key] === null) {
      newVal[key] = null;
    } else {
      newVal[key] = options.properties[key].type.readSync("json-doc", diff.set[key]);
    }
  }
  for (const key in diff.fromNull) {
    newVal[key] = options.properties[key].type.readSync("json-doc", diff.fromNull[key]);
  }
  for (const key in diff.toNull) {
    newVal[key] = null;
  }
  for (const key in diff.update) {
    newVal[key] = options.properties[key].type.patchSync(newVal[key], diff.update[key]);
  }
  return newVal;
}

function reverseDiffSync (
  diff: DocumentDiff | null,
  options?: DocumentOptionsFull<VersionedTypeSync<any, any, any>>
): DocumentDiff | null {
  // TODO: clone the other values
  let reversed: DocumentDiff = {
    set: diff.unset,
    unset: diff.set,
    toNull: diff.fromNull,
    fromNull: diff.toNull,
    update: {}
  };
  for (const key in diff.update) {
    reversed.update[key] = options.properties[key].type.reverseDiffSync(diff.update[key]);
  }
  return reversed;
}

export class DocumentTypeError extends ViaTypeError {}

export class MissingKeysError extends DocumentTypeError {
  constructor (missingKeys: string[]) {
    super (null, "missing-keys", {missingKeys: missingKeys}, `The following keys are missing: ${JSON.stringify(missingKeys)}`);
  }
}

export class ExtraKeysError extends DocumentTypeError {
  constructor (extraKeys: string[]) {
    super (null, "extra-keys", {extraKeys: extraKeys}, `The following keys are extraneous: ${JSON.stringify(extraKeys)}`);
  }
}

export class ForbiddenNullError extends DocumentTypeError {
  constructor (key: string) {
    super (null, "forbidden-null", {key: key}, `The value \`null\` is forbidden for the key ${key}`);
  }
}

export class InvalidProperties extends DocumentTypeError {
  constructor (errors: Dictionary<Error>) {
    super (null, "invalid-properties", {errors: errors}, `The following properties are invalid: ${JSON.stringify(errors)}`);
  }
}
