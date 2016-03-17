import * as Promise from "bluebird";
import { Type, CollectionType, CollectionTypeAsync } from "via-core";
export interface ArrayOptions {
    maxLength: number;
}
export declare class ArrayType implements CollectionTypeAsync<any[], any> {
    isSync: boolean;
    name: string;
    options: ArrayOptions;
    itemType: Type<any, any>;
    constructor(itemType: Type<any, any>, options: ArrayOptions);
    readSync(format: string, val: any): any[];
    read(format: string, val: any): Promise<any[]>;
    writeSync(format: string, val: any[]): any;
    write(format: string, val: any[]): Promise<any>;
    testSync(val: any[]): Error;
    test(val: any[]): Promise<Error>;
    normalizeSync(val: any): any;
    normalize(val: any): Promise<any>;
    equalsSync(val1: any, val2: any): boolean;
    equals(val1: any, val2: any): Promise<boolean>;
    cloneSync(val: any): any;
    clone(val: any): Promise<any>;
    diffSync(oldVal: any, newVal: any): number;
    diff(oldVal: any, newVal: any): Promise<number>;
    patchSync(oldVal: any, diff: number): any;
    patch(oldVal: any, diff: number): Promise<any>;
    revertSync(newVal: any, diff: number): any;
    revert(newVal: any, diff: number): Promise<any>;
    reflect(visitor: (value?: any, key?: string, parent?: CollectionType<any, any>) => any): Promise<void>;
}
