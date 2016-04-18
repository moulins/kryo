import * as Bluebird from "bluebird";
import { utils, type } from "via-core";
import { ViaTypeError } from "./helpers/via-type-error";
export interface ArrayOptions {
    maxLength: number;
    itemType: type.Type<any, any>;
}
export declare class ArrayTypeError extends ViaTypeError {
}
export declare class ItemsTestError extends ArrayTypeError {
    constructor(errors: utils.NumericDictionary<Error>);
}
export declare class MaxLengthError extends ArrayTypeError {
    constructor(array: any[], maxLength: number);
}
export declare class ArrayType implements type.CollectionTypeAsync<any[], any> {
    isSync: boolean;
    name: string;
    options: ArrayOptions;
    constructor(options: ArrayOptions);
    readTrustedSync(format: string, val: any): any[];
    readTrusted(format: string, val: any, opt: ArrayOptions): Bluebird<any[]>;
    readSync(format: string, val: any): any[];
    read(format: string, val: any): Bluebird<any[]>;
    writeSync(format: string, val: any[]): any;
    write(format: string, val: any[]): Bluebird<any>;
    testSync(val: any[]): Error;
    test(val: any[]): Bluebird<Error>;
    equalsSync(val1: any, val2: any): boolean;
    equals(val1: any, val2: any): Bluebird<boolean>;
    cloneSync(val: any): any;
    clone(val: any): Bluebird<any>;
    diffSync(oldVal: any, newVal: any): any;
    diff(oldVal: any, newVal: any): Bluebird<any>;
    patchSync(oldVal: any, diff: any): any;
    patch(oldVal: any, diff: any): Bluebird<any>;
    revertSync(newVal: any, diff: any): any;
    revert(newVal: any, diff: any): Bluebird<any>;
    reflect(visitor: (value?: any, key?: string, parent?: type.CollectionType<any, any>) => any): Bluebird<void>;
    diffToUpdate(newVal: any, diff: any, format: string): Bluebird<type.UpdateQuery>;
}
