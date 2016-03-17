import * as Promise from "bluebird";
import * as _ from "lodash";
import {Type, TypeSync, CollectionType, CollectionTypeAsync, CollectionTypeSync} from "via-core";

export interface Dictionnary<T> {
  [key: string]: T;
}

export interface DocumentOptions {
  ignoreExtraKeys?: boolean;
  optionalProperties?: string[]; // null: all
}

let defaultOptions: DocumentOptions = {
  ignoreExtraKeys: false,
  optionalProperties: []
};

export class DocumentType implements CollectionTypeAsync<any, any> {

  isSync: boolean = true;
  name: string = "document";
  options: DocumentOptions;
  properties: Dictionnary<Type<any, any>>;

  constructor (properties: Dictionnary<Type<any, any>>, options: DocumentOptions) {
    this.options = _.assign(_.clone(defaultOptions), options);
    for (let key in properties) {
      this.isSync = this.isSync && properties[key].isSync;
    }
    this.properties = properties;
  }

  readSync(format: string, val: any): any {
    throw new Error("DocumentType does not support readSync");
  }

  read(format: string, val: any): Promise<Dictionnary<any>> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          if (!_.isPlainObject(val)) {
            return Promise.reject(new Error("Expected plain object"));
          }

          val = <Dictionnary<any>> val;

          return Promise
            .props(_.mapValues(val, (member: any, key: string, doc: Dictionnary<any>) => {
              if (key in this.properties) {
                return this.properties[key].read(format, member);
              } else {
                return Promise.reject(new Error("Unknown property "+key));
              }
            }));
        default:
          return Promise.reject(new Error("Format is not supported"));
      }
    });
  }

  writeSync(format: string, val: Dictionnary<any>): any {
    throw new Error("DocumentType does not support writeSync");
  }

  write(format: string, val: Dictionnary<any>): Promise<any> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          return Promise
            .props(_.mapValues(val, (member: any, key: string, doc: Dictionnary<any>) => {
              if (key in this.properties) {
                return this.properties[key].write(format, member);
              } else {
                return Promise.reject(new Error("DocumentType:write -> unknown field " + key));
              }
            }));
        default:
          return Promise.reject(new Error("Format is not supported"));
      }
    });
  }

  testSync (val: any): Error {
    throw new Error("DocumentType does not support testSync");
  }

  test (val: any): Promise<Error> {
    return Promise.try(() => {
      // let options: DocumentOptions = _.merge({}, this.options, opt);
      let options = this.options;

      // TODO: keep this test ?
      if (!_.isPlainObject(val)) {
        return Promise.resolve(new Error("Expected plain object"));
      }

      let curKeys: string[] = _.keys(val);
      let expectedKeys: string[] = _.keys(this.properties);

      if (!options.ignoreExtraKeys) {
        let extraKeys: string[] = _.difference(curKeys, expectedKeys);
        if (extraKeys.length) {
          return Promise.resolve(new Error("Unexpected extra keys: "+extraKeys.join(", ")));
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
          return this.properties[key]
            .test(val[key])
            .then((err: Error) => {
              return [key, err];
            });
        })
        .then(function(results: Array<string|Error>[]) {
          let errors: Error[] = [];
          for (let i = 0, l = results.length; i<l; i++) {
            let key: string = <string> results[i][0];
            let err: Error = <Error> results[i][1];
            if (err !== null) {
              // errors.push(new Error(err, "Invalid value at field "+results[i][0]))
              errors.push(new Error(`Invalid value at field ${key}: ${err.message}`));
            }
          }
          if (errors.length) {
            return new Error("Failed test for some properties");
            // return new _Error(errors, "typeError", "Failed test on fields")
          }
          return null;
        });
    });
  }

  normalizeSync(val: any): any {
    throw new Error("DocumentType does not support normalizeSync");
  }

  normalize (val: any): Promise<any> {
    return Promise.resolve(val);
  }

  equalsSync(val1: any, val2: any): boolean {
    throw new Error("DocumentType does not support equalsSync");
  }

  equals (val1: any, val2: any): Promise<boolean> {
    return Promise.reject(new Error("ArrayType does not support equals"));
  }

  cloneSync(val: any): any {
    throw new Error("DocumentType does not support cloneSync");
  }

  clone (val: any): Promise<any> {
    return Promise.resolve(this.cloneSync(val));
  }

  diffSync(oldVal: any, newVal: any): number {
    throw new Error("DocumentType does not support diffSync");
  }

  diff (oldVal: any, newVal: any): Promise<number> {
    return Promise.resolve(this.diffSync(oldVal, newVal));
  }

  patchSync(oldVal: any, diff: number): any {
    throw new Error("DocumentType does not support patchSync");
  }

  patch (oldVal: any, diff: number): Promise<any> {
    return Promise.resolve(this.patchSync(oldVal, diff));
  }

  revertSync(newVal: any, diff: number): any {
    throw new Error("DocumentType does not support revertSync");
  }

  revert (newVal: any, diff: number): Promise<any> {
    return Promise.resolve(this.revertSync(newVal, diff));
  }

  // forEach (value:any, visitor:(childValue: any, key: string, childType: Type, self: CollectionType) => any): Promise<any> {
  //   let childType: Type|CollectionType;
  //   for(let key in this.properties){
  //     if (!(key in value)) {
  //       continue
  //     }
  //     childType = this.properties[key];
  //     iterator(value[key], key, childType, this);
  //     if ((<CollectionType>childType).forEach) {
  //       (<CollectionType>childType).forEach(value[key], visitor);
  //     }
  //   }
  //   return undefined;
  // }

  reflect (visitor: (value?: any, key?: string, parent?: CollectionType<any, any>) => any) {
    return Promise.try(() => {
      let childType: Type<any, any>;
      for (let prop in this.properties) {
        childType = this.properties[prop];
        visitor(childType, prop, this);
        if ((<CollectionType<any, any>> childType).reflect) {
          (<CollectionType<any, any>> childType).reflect(visitor);
        }
      }
    });
  }
}
