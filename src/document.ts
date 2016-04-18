import * as Bluebird from "bluebird";
import * as _ from "lodash";
import {utils, type} from "via-core";
import {UnavailableSyncError, UnsupportedFormatError, ViaTypeError, UnexpectedTypeError} from "./helpers/via-type-error";

export interface PropertyDescriptor {
  type?: type.Type<any, any>;
  optional?: boolean;
  nullable?: boolean;
}

export interface DocumentOptions {
  additionalProperties?: boolean;
  allowPartial?: boolean;
  properties?: utils.Dictionary<PropertyDescriptor>;
}

let defaultOptions: DocumentOptions = {
  additionalProperties: false,
  allowPartial: false,
  properties: {}
};

export interface EqualsOptions {
  partial?: boolean;
  throw?: boolean;
}

export interface KeyDiffResult {
  commonKeys: string[];
  missingKeys: string[];
  extraKeys: string[];
}

export class DocumentTypeError extends ViaTypeError {}

export class MissingKeysError extends DocumentTypeError {
  constructor (keys: string[]) {
    super (null, "MissingKeysError", {keys: keys}, `Expected keys are missing: ${keys.join(", ")}`)
  }
}

export class ExtraKeysError extends DocumentTypeError {
  constructor (keys: string[]) {
    super (null, "ExtraKeysError", {keys: keys}, `Unexpected extra keys (unkown properties): ${keys.join(", ")}`)
  }
}

export class ForbiddenNullError extends DocumentTypeError {
  constructor (propertyName: string) {
    super (null, "ForbiddenNullError", {property: propertyName}, `The property ${propertyName} cannot be null`)
  }
}

export class PropertiesTestError extends DocumentTypeError {
  constructor (errors: utils.Dictionary<Error>) {
    let errorDetails = "";
    let first = true;
    for (let prop in errors) {
      errorDetails = errorDetails + (first ? "" : ", ") + prop + ": " + errors[prop];
      first = false;
    }
    super (null, "PropertiesTestError", {errors: errors}, `Failed test for the properties: {${errorDetails}}`);
  }
}

export class DocumentType implements type.CollectionType<utils.Document, type.DocumentDiff> {

  isSync: boolean = true;
  name: string = "document";
  options: DocumentOptions;

  constructor (options?: DocumentOptions) {
    this.options = _.assign(_.clone(defaultOptions), options);
    this.updatedIsSync();
  }

  updatedIsSync (): boolean {
    this.isSync = true;
    for (let key in this.options.properties) {
      let property = this.options.properties[key];
      if (property && property.type && !property.type.isSync) {
        this.isSync = false;
        break;
      }
    }
    return this.isSync;
  }

  readTrustedSync(format: string, val: any): utils.Document {
    throw new UnavailableSyncError(this, "readTrusted");
  }

  readTrusted(format: string, val: any, opt: DocumentOptions): Bluebird<utils.Document> {
    return Bluebird.try(() => {
      let options: DocumentOptions = opt ? DocumentType.mergeOptions(this.options, opt) : this.options;

      switch (format) {
        case "bson":
        case "json":
          val = <utils.Document> val;
          let keysDiff = DocumentType.keysDiff(val, options.properties);

          return Bluebird
            .props(
              _.zipObject(
                keysDiff.commonKeys,
                _.map(keysDiff.commonKeys, (key: string) => {
                  let member: any = val[key];
                  let property = options.properties[key];
                  if (member === null) {
                    return Bluebird.resolve(null);
                  }
                  if (property.type) {
                    return property.type.readTrusted(format, member);
                  } else {
                    return Bluebird.resolve(member);
                  }
                })
              )
            );
        default:
          return Bluebird.reject(new UnsupportedFormatError(format));
      }
    });
  }

  readSync(format: string, val: any): utils.Document {
    throw new UnavailableSyncError(this, "read");
  }

  read(format: string, val: any, opt: DocumentOptions): Bluebird<utils.Document> {
    return Bluebird.try(() => {
      let options: DocumentOptions = opt ? DocumentType.mergeOptions(this.options, opt) : this.options;

      switch (format) {
        case "bson":
        case "json":
          val = <utils.Document> val;
          let keysDiff = DocumentType.keysDiff(val, options.properties);

          let missingMandatoryKeys = _.filter(keysDiff.missingKeys, (key) => {
            return !options.properties[key].optional;
          });
          if (missingMandatoryKeys.length && !options.allowPartial) {
            return Bluebird.reject(new MissingKeysError(missingMandatoryKeys));
          }

          return Bluebird
            .props(
              _.zipObject(
                keysDiff.commonKeys,
                _.map(keysDiff.commonKeys, (key: string) => {
                  let member: any = val[key];
                  let property = options.properties[key];
                  if (member === null) {
                    if (property.nullable) {
                      return Bluebird.resolve(null);
                    } else {
                      return Bluebird.reject(new ForbiddenNullError(key));
                    }
                  }
                  if (property.type) {
                    return property.type.read(format, member);
                  } else {
                    // Reading an untyped property !
                    return Bluebird.resolve(member);
                  }
                })
              )
            );
        default:
          return Bluebird.reject(new UnsupportedFormatError(format));
      }
    });
  }

  writeSync(format: string, val: utils.Document, opt: DocumentOptions): any {
    throw new UnavailableSyncError(this, "write");
  }

  write(format: string, val: utils.Document, opt: DocumentOptions): Bluebird<any> {
    return Bluebird.try(() => {
      let options: DocumentOptions = opt ? DocumentType.mergeOptions(this.options, opt) : this.options;

      switch (format) {
        case "bson":
        case "json":
          val = <utils.Document> val;
          let keysDiff = DocumentType.keysDiff(val, options.properties);

          return Bluebird
            .props(
              _.zipObject(
                keysDiff.commonKeys,
                _.map(keysDiff.commonKeys, (key: string) => {
                  let member: any = val[key];
                  let property = options.properties[key];
                  if (member === null) {
                    return Bluebird.resolve(null);
                  }
                  if (property.type) {
                    return property.type.write(format, member);
                  } else {
                    return Bluebird.resolve(member);
                  }
                })
              )
            );
        default:
          return Bluebird.reject(new UnsupportedFormatError(format));
      }
    });
  }

  testSync (val: utils.Document, options?: DocumentOptions): Error {
    throw new UnavailableSyncError(this, "test");
  }

  test (val: utils.Document, opt?: DocumentOptions): Bluebird<Error> {
    return Bluebird.try(() => {
      let options: DocumentOptions = opt ? DocumentType.mergeOptions(this.options, opt) : this.options;

      // TODO: keep this test ?
      if (!_.isPlainObject(val)) {
        return Bluebird.resolve(new UnexpectedTypeError(typeof val, "object"));
      }

      let curKeys: string[] = _.keys(val);
      let expectedKeys: string[] = _.keys(options.properties);

      if (!options.additionalProperties) {
        let extraKeys: string[] = _.difference(curKeys, expectedKeys);
        if (extraKeys.length) {
          return Bluebird.resolve(new ExtraKeysError(extraKeys));
        }
      }

      curKeys = _.intersection(curKeys, expectedKeys);

      return Bluebird
        .map(curKeys, (key: string, i: number, len: number) => {
          let property: PropertyDescriptor = options.properties[key];
          if (val[key] === null) {
            let err: Error;
            if (property.nullable) {
              err = null;
            } else {
              err = new ForbiddenNullError(key);
            }
            return Bluebird.resolve([key, err]);
          }

          return property.type
            .test(val[key])
            .then((err: Error) => {
              return [key, err];
            });
        })
        .then(function(results: Array<[string, Error]>) {
          results = _.filter(results, (result: [string, Error]) => {
              return result[1] !== null;
            });

          if (results.length) {
            let errorsDictionary: utils.Dictionary<Error> = _.fromPairs(results);
            return new PropertiesTestError(errorsDictionary);
          }

          return null;
        });
    });
  }

  equalsSync(val1: utils.Document, val2: utils.Document): boolean {
    throw new UnavailableSyncError(this, "equals");
  }

  equals (val1: utils.Document, val2: utils.Document, options?: EqualsOptions): Bluebird<boolean> {
    return Bluebird
      .try(() => {
        let keys: string[] = _.keys(this.options.properties);
        let val1Keys: string[] = _.intersection(keys, _.keys(val1));
        let val2Keys: string[] = _.intersection(keys, _.keys(val2));

        if (val1Keys.length === keys.length && val2Keys.length === keys.length) {
          return Bluebird.resolve(keys);
        }

        // if (!options || !options.partial) {
        //   return Promise.resolve(new Error("Missing keys"));
        // }

        let extraKeys: string[] = _.difference(val1Keys, val2Keys);
        let missingKeys: string[] = _.difference(val2Keys, val1Keys);

        if (extraKeys.length) {
          return Bluebird.reject(new ExtraKeysError(extraKeys));
        }

        if (missingKeys.length) {
          return Bluebird.reject(new MissingKeysError(missingKeys));
        }

        return Bluebird.resolve(val1Keys);
      })
      .then<boolean>((keys: string[]) => {
        return Bluebird
          .map(keys, (key: string) => {
            let property: PropertyDescriptor = this.options.properties[key];
            return property.type.equals(val1[key], val2[key]);
          })
          .then((equalsResults: boolean[]) => {
            let equals: boolean = equalsResults.indexOf(false) < 0;
            if (equals) {
              return Bluebird.resolve(true);
            } else if (options && options.throw) {
              let diffKeys: string[] = _.filter(keys, (key: string, index: number): boolean => equalsResults[index] === false);
              return Bluebird.resolve(false);
              // return Promise.reject(new Error(`The objects are not equal because the following keys are not equal: ${diffKeys.join(", ")}`));
            } else {
              return Bluebird.resolve(false);
            }
          });
      })
      .catch((err: Error) => {
        if (options && options.throw) {
          return Bluebird.reject(err);
        } else {
          return Bluebird.resolve(false);
        }
      });
  }

  cloneSync(val: utils.Document): utils.Document {
    throw new UnavailableSyncError(this, "clone");
  }

  clone (val: utils.Document): Bluebird<utils.Document> {
    return Bluebird.resolve(this.cloneSync(val));
  }

  diffSync(oldVal: utils.Document, newVal: utils.Document): type.DocumentDiff {
    throw new UnavailableSyncError(this, "diff");
  }

  diff (oldVal: utils.Document, newVal: utils.Document): Bluebird<type.DocumentDiff> {
    return Bluebird.resolve(this.diffSync(oldVal, newVal));
  }

  patchSync(oldVal: utils.Document, diff: type.DocumentDiff): utils.Document {
    throw new UnavailableSyncError(this, "patch");
  }

  patch (oldVal: utils.Document, diff: type.DocumentDiff): Bluebird<utils.Document> {
    return Bluebird.resolve(this.patchSync(oldVal, diff));
  }

  revertSync(newVal: utils.Document, diff: type.DocumentDiff): utils.Document {
    throw new UnavailableSyncError(this, "revert");
  }

  revert (newVal: utils.Document, diff: type.DocumentDiff): Bluebird<utils.Document> {
    return Bluebird.resolve(this.revertSync(newVal, diff));
  }

  reflect (visitor: (value?: any, key?: string, parent?: type.CollectionType<any, any>) => any): any {
    return Bluebird.try(() => {
      let childType: type.Type<any, any>;
      for (let prop in this.options.properties) {
        childType = this.options.properties[prop].type;
        visitor(childType, prop, this);
        if ((<type.CollectionType<any, any>> childType).reflect) {
          (<type.CollectionType<any, any>> childType).reflect(visitor);
        }
      }
    });
  }

  reflectSync (visitor: (value?: any, key?: any, parent?: type.CollectionType<any, any>) => any): any {
    if (!this.isSync) {
      throw new UnavailableSyncError(this, "reflect");
    }

    let childType: type.TypeSync<any, any>;
    for (let prop in this.options.properties) {
      childType = <type.TypeSync<any, any>> <any> this.options.properties[prop].type;
      visitor(childType, prop, <type.CollectionType<utils.Document, type.DocumentDiff>> <any> this);
      if ((<type.CollectionType<any, any>> <any> childType).reflectSync) {
        (<type.CollectionType<any, any>> <any> childType).reflectSync(visitor);
      }
    }
    return this;
  }

  // TODO: Promise.try
  diffToUpdate (newVal: utils.Document, diff: type.DocumentDiff, format: string): Bluebird<type.UpdateQuery> {
    let update: type.UpdateQuery = {
      $set: {},
      $unset: {}
    };

    if (diff === null) {
      return Bluebird.resolve(update);
    }

    for (let key in diff.unset) {
      update.$unset[key] = true;
    }

    let setPromises: Bluebird<any>[] = _.map(diff.set, (value: any, field: string) => {
      let property:PropertyDescriptor = this.options.properties[field];
      return Bluebird.resolve(property.type
        .write(format, newVal[field]))
        .then((encoded:any) => update.$set[field] = encoded);
    });

    // TODO: recursivity, etc.
    let updatePromises: Bluebird<any>[] = _.map(diff.update, (value: any, field: string) => {
      let property:PropertyDescriptor = this.options.properties[field];
      return Bluebird.resolve(property.type
        .write(format, newVal[field]))
        .then((encoded:any) => update.$set[field] = encoded);
    });

    return Bluebird
      .all(_.concat(setPromises, updatePromises))
      .thenReturn(update);
  }

  static assignOptions (target: DocumentOptions, source: DocumentOptions): DocumentOptions {
    if (!source) {
      return target || {};
    }
    // TODO: cleaner assignation
    let oldProps = target.properties;
    _.assign(target, source);
    target.properties = oldProps;
    if (source.properties) {
      if (!target.properties) {
        target.properties = {};
      }
      for (let propertyName in source.properties) {
        if (source.properties[propertyName] === null) {
          delete target.properties[propertyName];
        } else {
          target.properties[propertyName] = <PropertyDescriptor> _.assign({}, target.properties[propertyName], source.properties[propertyName]);
        }
      }
    }
    return target;
  }

  static cloneOptions (source: DocumentOptions): DocumentOptions {
    return DocumentType.assignOptions({}, source);
  }

  static mergeOptions (target: DocumentOptions, source: DocumentOptions): DocumentOptions {
    return DocumentType.assignOptions(DocumentType.cloneOptions(target), source);
  }

  static keysDiff (subject: utils.Document, reference: utils.Document): KeyDiffResult {
    let subjectKeys: string[] = _.keys(subject);
    let referenceKeys: string[] = _.keys(reference);

    return {
      commonKeys: _.intersection(subjectKeys, referenceKeys),
      missingKeys: _.difference(referenceKeys, subjectKeys),
      extraKeys: _.difference(subjectKeys, referenceKeys)
    }
  }
}
