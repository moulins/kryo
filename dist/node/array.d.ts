import * as Promise from "bluebird";
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
    readTrusted(format: string, val: any, opt: ArrayOptions): Promise<any[]>;
    readSync(format: string, val: any): any[];
    read(format: string, val: any): Promise<any[]>;
    writeSync(format: string, val: any[]): any;
    write(format: string, val: any[]): Promise<any>;
    testSync(val: any[]): Error;
    test(val: any[]): Promise<Error>;
    equalsSync(val1: any, val2: any): boolean;
    equals(val1: any, val2: any): Promise<boolean>;
    cloneSync(val: any): any;
    clone(val: any): Promise<any>;
    diffSync(oldVal: any, newVal: any): any;
    diff(oldVal: any, newVal: any): Promise<any>;
    patchSync(oldVal: any, diff: any): any;
    patch(oldVal: any, diff: any): Promise<any>;
    revertSync(newVal: any, diff: any): any;
    revert(newVal: any, diff: any): Promise<any>;
    reflect(visitor: (value?: any, key?: string, parent?: type.CollectionType<any, any>) => any): Promise<void>;
    diffToUpdate(newVal: any, diff: any, format: string): Promise<type.UpdateQuery>;
}
