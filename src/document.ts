import * as Promise from "bluebird";
import * as _ from "lodash";
import {Dictionary, Document, Type, TypeSync, CollectionType, DocumentDiff, UpdateQuery} from "via-core";
import {UnavailableSyncError, UnsupportedFormatError, ViaTypeError, UnexpectedTypeError} from "./via-type-error";

export interface PropertyDescriptor {
  type?: Type<any, any>;
  optional?: boolean;
  nullable?: boolean;
}

export interface DocumentOptions {
  additionalProperties?: boolean;
  properties?: Dictionary<PropertyDescriptor>;
}

let defaultOptions: DocumentOptions = {
  additionalProperties: false,
  properties: {}
};

export interface EqualsOptions {
  partial?: boolean;
  throw?: boolean;
}

export class DocumentTypeError extends ViaTypeError {}

export class MissingKeysError extends DocumentTypeError {
  constructor (keys: string[]) {
    super (null, "MissingKeysError", {keys: keys}, `Expected missing keys: ${keys.join(", ")}`)
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
  constructor (errors: Dictionary<Error>) {
    super (null, "PropertiesTestError", {errors: errors}, `Failed test for the properties: ${_.keys(errors).join(", ")}`);
  }
}

export class DocumentType implements CollectionType<Document, DocumentDiff> {

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

  readTrustedSync(format: string, val: any): Document {
    throw new UnavailableSyncError(this, "readTrusted");
  }

  readTrusted(format: string, val: any): Promise<Document> {
    return this.read(format, val);
  }

  readSync(format: string, val: any): Document {
    throw new UnavailableSyncError(this, "read");
  }

  read(format: string, val: any): Promise<Document> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          if (!_.isPlainObject(val)) {
            return Promise.reject(new UnexpectedTypeError(typeof val, "object"));
          }

          val = <Dictionary<any>> val;

          return Promise
            .props(_.mapValues(val, (member: any, key: string, doc: Dictionary<any>) => {
              if (this.options.properties[key]) {
                let property = this.options.properties[key];
                if (property.type) {
                  return property.type.read(format, member);
                } else {
                  // no property type declared, leave it to be manually managed
                  // TODO: console.warn ?
                  return Promise.resolve(member);
                }
              } else {
                // ignore undeclared properties
                return Promise.resolve(undefined);
              }
            }));
        default:
          return Promise.reject(new UnsupportedFormatError(format));
      }
    });
  }

  writeSync(format: string, val: Document): any {
    throw new UnavailableSyncError(this, "write");
  }

  write(format: string, val: Document): Promise<any> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          return Promise
            .props(_.mapValues(val, (member: any, key: string, doc: Dictionary<any>) => {
              if (this.options.properties[key]) {
                let property = this.options.properties[key];
                if (property.type) {
                  return property.type.write(format, member);
                } else {
                  // no property type declared, leave it to be manually managed
                  // TODO: console.warn ?
                  return member;
                }
              } else {
                return undefined; // ignore undeclared properties during write
              }
            }));
        default:
          return Promise.reject(new UnsupportedFormatError(format));
      }
    });
  }

  testSync (val: Document, options?: DocumentOptions): Error {
    throw new UnavailableSyncError(this, "test");
  }

  test (val: Document, opt?: DocumentOptions): Promise<Error> {
    return Promise.try(() => {
      let options: DocumentOptions = DocumentType.mergeOptions(this.options, opt);

      // TODO: keep this test ?
      if (!_.isPlainObject(val)) {
        return Promise.resolve(new UnexpectedTypeError(typeof val, "object"));
      }

      let curKeys: string[] = _.keys(val);
      let expectedKeys: string[] = _.keys(options.properties);

      if (!options.additionalProperties) {
        let extraKeys: string[] = _.difference(curKeys, expectedKeys);
        if (extraKeys.length) {
          return Promise.resolve(new ExtraKeysError(extraKeys));
        }
      }

      // if (!options.allowPartial) {
      //   let missingKeys: string[] = _.difference(expectedKeys, curKeys);
      //   if (missingKeys.length) {
      //     return new Error("Expected missing keys: "+missingKeys);
      //   }
      // }

      curKeys = _.intersection(curKeys, expectedKeys);

      return Promise
        .map(curKeys, (key: string, i: number, len: number) => {
          let property: PropertyDescriptor = options.properties[key];
          if (val[key] === null) {
            let err: Error;
            if (property.optional) {
              err = null;
            } else {
              err = new ForbiddenNullError(key);
            }
            return Promise.resolve([key, err]);
          }

          return property.type
            .test(val[key])
            .then((err: Error) => {
              return [key, err];
            });
        })
        .then(function(results: Array<[string, Error]>) {
          results = _.filter(results, (result: [string, Error]) => {
              return result[0] !== null;
            });

          if (results.length) {
            let errorsDictionary: Dictionary<Error> = _.fromPairs(results);
            return new PropertiesTestError(errorsDictionary);
          }

          return null;
        });
    });
  }

  equalsSync(val1: Document, val2: Document): boolean {
    throw new UnavailableSyncError(this, "equals");
  }

  equals (val1: Document, val2: Document, options?: EqualsOptions): Promise<boolean> {
    return Promise
      .try(() => {
        let keys: string[] = _.keys(this.options.properties);
        let val1Keys: string[] = _.intersection(keys, _.keys(val1));
        let val2Keys: string[] = _.intersection(keys, _.keys(val2));

        if (val1Keys.length === keys.length && val2Keys.length === keys.length) {
          return Promise.resolve(keys);
        }

        // if (!options || !options.partial) {
        //   return Promise.resolve(new Error("Missing keys"));
        // }

        let extraKeys: string[] = _.difference(val1Keys, val2Keys);
        let missingKeys: string[] = _.difference(val2Keys, val1Keys);

        if (extraKeys.length) {
          return Promise.reject(new ExtraKeysError(extraKeys));
        }

        if (missingKeys.length) {
          return Promise.reject(new MissingKeysError(missingKeys));
        }

        return Promise.resolve(val1Keys);
      })
      .then<boolean>((keys: string[]) => {
        return Promise
          .map(keys, (key: string) => {
            let property: PropertyDescriptor = this.options.properties[key];
            return property.type.equals(val1[key], val2[key]);
          })
          .then((equalsResults: boolean[]) => {
            let equals: boolean = equalsResults.indexOf(false) < 0;
            if (equals) {
              return Promise.resolve(true);
            } else if (options && options.throw) {
              let diffKeys: string[] = _.filter(keys, (key: string, index: number): boolean => equalsResults[index] === false);
              return Promise.resolve(false);
              // return Promise.reject(new Error(`The objects are not equal because the following keys are not equal: ${diffKeys.join(", ")}`));
            } else {
              return Promise.resolve(false);
            }
          });
      })
      .catch((err: Error) => {
        if (options && options.throw) {
          return Promise.reject(err);
        } else {
          return Promise.resolve(false);
        }
      });
  }

  cloneSync(val: Document): Document {
    throw new UnavailableSyncError(this, "clone");
  }

  clone (val: Document): Promise<Document> {
    return Promise.resolve(this.cloneSync(val));
  }

  diffSync(oldVal: Document, newVal: Document): DocumentDiff {
    throw new UnavailableSyncError(this, "diff");
  }

  diff (oldVal: Document, newVal: Document): Promise<DocumentDiff> {
    return Promise.resolve(this.diffSync(oldVal, newVal));
  }

  patchSync(oldVal: Document, diff: DocumentDiff): Document {
    throw new UnavailableSyncError(this, "patch");
  }

  patch (oldVal: Document, diff: DocumentDiff): Promise<Document> {
    return Promise.resolve(this.patchSync(oldVal, diff));
  }

  revertSync(newVal: Document, diff: DocumentDiff): Document {
    throw new UnavailableSyncError(this, "revert");
  }

  revert (newVal: Document, diff: DocumentDiff): Promise<Document> {
    return Promise.resolve(this.revertSync(newVal, diff));
  }

  reflect (visitor: (value?: any, key?: string, parent?: CollectionType<any, any>) => any): any {
    return Promise.try(() => {
      let childType: Type<any, any>;
      for (let prop in this.options.properties) {
        childType = this.options.properties[prop].type;
        visitor(childType, prop, this);
        if ((<CollectionType<any, any>> childType).reflect) {
          (<CollectionType<any, any>> childType).reflect(visitor);
        }
      }
    });
  }

  reflectSync (visitor: (value?: any, key?: any, parent?: CollectionType<any, any>) => any): any {
    if (!this.isSync) {
      throw new UnavailableSyncError(this, "reflect");
    }

    let childType: TypeSync<any, any>;
    for (let prop in this.options.properties) {
      childType = <TypeSync<any, any>> <any> this.options.properties[prop].type;
      visitor(childType, prop, <CollectionType<Document, DocumentDiff>> <any> this);
      if ((<CollectionType<any, any>> <any> childType).reflectSync) {
        (<CollectionType<any, any>> <any> childType).reflectSync(visitor);
      }
    }
    return this;
  }

  // TODO: Promise.try
  diffToUpdate (newVal: Document, diff: DocumentDiff, format: string): Promise<UpdateQuery> {
    let update: UpdateQuery = {
      $set: {},
      $unset: {}
    };

    if (diff === null) {
      return Promise.resolve(update);
    }

    for (let key in diff.unset) {
      update.$unset[key] = true;
    }

    let setPromises: Promise<any>[] = _.map(diff.set, (value: any, field: string) => {
      let property:PropertyDescriptor = this.options.properties[field];
      return Promise.resolve(property.type
        .write(format, newVal[field]))
        .then((encoded:any) => update.$set[field] = encoded);
    });

    // TODO: recursivity, etc.
    let updatePromises: Promise<any>[] = _.map(diff.update, (value: any, field: string) => {
      let property:PropertyDescriptor = this.options.properties[field];
      return Promise.resolve(property.type
        .write(format, newVal[field]))
        .then((encoded:any) => update.$set[field] = encoded);
    });

    return Promise
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
}
