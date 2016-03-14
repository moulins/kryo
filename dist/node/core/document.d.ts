import * as Promise from "bluebird";
import { Type } from "./interfaces/type";
import { CollectionType, CollectionTypeAsync } from "./interfaces/collection-type";
export interface Dictionnary<T> {
    [key: string]: T;
}
export interface DocumentOptions {
    ignoreExtraKeys?: boolean;
    optionalProperties?: string[];
}
export declare class DocumentType implements CollectionTypeAsync<any, any> {
    isSync: boolean;
    name: string;
    options: DocumentOptions;
    properties: Dictionnary<Type<any, any>>;
    constructor(properties: Dictionnary<Type<any, any>>, options: DocumentOptions);
    readSync(format: string, val: any): any;
    read(format: string, val: any): Promise<Dictionnary<any>>;
    writeSync(format: string, val: Dictionnary<any>): any;
    write(format: string, val: Dictionnary<any>): Promise<any>;
    testSync(val: any): Error;
    test(val: any): Promise<Error>;
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
