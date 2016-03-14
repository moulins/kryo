import * as Promise from "bluebird";
import * as _ from "lodash";
import {Type, TypeSync} from "./interfaces/type";
import {CollectionType, CollectionTypeAsync, CollectionTypeSync} from "./interfaces/collection-type";

export interface ArrayOptions {
  maxLength: number;
}

let defaultOptions: ArrayOptions = {
  maxLength: 100
};

export class ArrayType implements CollectionTypeAsync<any[], any> {

  isSync: boolean = true;
  name: string = "array";
  options: ArrayOptions;
  itemType: Type<any, any>;

  constructor (itemType: Type<any, any>, options: ArrayOptions) {
    this.options = <ArrayOptions> _.assign(_.clone(defaultOptions), options);
    this.isSync = itemType.isSync;
    this.itemType = itemType;
  }

  readSync(format: string, val: any): any[] {
    throw new Error("ArrayType does not support readSync");
  }

  read(format: string, val: any): Promise<any[]> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          return Promise
            .map(val, (item: any, i: number, len: number) => {
              return this.itemType.read(format, item);
            });
        default:
          return Promise.reject(new Error("Format is not supported"));
      }
    });
  }

  writeSync(format: string, val: any[]): any {
    throw new Error("ArrayType does not support writeSync");
  }

  write(format: string, val: any[]): Promise<any> {
    return Promise.try(() => {
      switch (format) {
        case "bson":
        case "json":
          return Promise
            .map(val, (item: any, i: number, len: number) => {
              return this.itemType.write(format, item);
            });

        default:
          return Promise.reject(new Error("Format is not supported"));
      }
    });
  }

  testSync (val: any[]): Error {
    throw new Error("ArrayType does not support testSync");
  }

  test (val: any[]): Promise<Error> {
    return Promise.try((): Promise<Error> => {
      if (!_.isArray(val)) {
        return Promise.resolve(new Error("Expected array"));
      }

      if (this.options.maxLength !== null && val.length > this.options.maxLength) {
        return Promise.resolve(new Error("Array max length is " + this.options.maxLength));
      }

      if (this.itemType === null) { // any
        return Promise.resolve<Error>(null);
      }

      return Promise
        .map(val, (item: string, i: number, len: number) => {
          return this.itemType.test(item);
        })
        .then(function(res){
          let errors: Error[] = [];
          for (let i = 0, l = res.length; i < l; i++) {
            if (res[i] !== null) {
              errors.push(new Error("Invalid type at index "+i));
            }
          }
          if (errors.length) {
            // return new _Error(errors, "typeError", "Failed test on items")
            return new Error("Failed test on some items");
          }
          return null;
        });
    });
  }

  normalizeSync(val: any): any {
    throw new Error("ArrayType does not support normalizeSync");
  }

  normalize (val: any): Promise<any> {
    return Promise.resolve(val);
  }

  equalsSync(val1: any, val2: any): boolean {
    throw new Error("ArrayType does not support equalsSync");
  }

  equals (val1: any, val2: any): Promise<boolean> {
    return Promise.reject(new Error("ArrayType does not support equals"));
  }

  cloneSync(val: any): any {
    throw new Error("ArrayType does not support cloneSync");
  }

  clone (val: any): Promise<any> {
    return Promise.resolve(this.cloneSync(val));
  }

  diffSync(oldVal: any, newVal: any): number {
    throw new Error("ArrayType does not support diffSync");
  }

  diff (oldVal: any, newVal: any): Promise<number> {
    return Promise.resolve(this.diffSync(oldVal, newVal));
  }

  patchSync(oldVal: any, diff: number): any {
    throw new Error("ArrayType does not support patchSync");
  }

  patch (oldVal: any, diff: number): Promise<any> {
    return Promise.resolve(this.patchSync(oldVal, diff));
  }

  revertSync(newVal: any, diff: number): any {
    throw new Error("ArrayType does not support revertSync");
  }

  revert (newVal: any, diff: number): Promise<any> {
    return Promise.resolve(this.revertSync(newVal, diff));
  }

  reflect (visitor: (value?: any, key?: string, parent?: CollectionType<any, any>) => any) {
    return Promise.try(() => {
      visitor(this.itemType, null, this);
      if ((<CollectionType<any, any>> this.itemType).reflect) {
        (<CollectionType<any, any>> this.itemType).reflect(visitor);
      }
    });
  }
}
