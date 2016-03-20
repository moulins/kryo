import * as Promise from "bluebird";
import { Dictionary, Type, CollectionType } from "via-core";
export interface PropertyDescriptor {
    type: Type<any, any>;
    optional?: boolean;
    nullable?: boolean;
}
export interface DocumentOptions {
    additionalProperties?: boolean;
    properties?: Dictionary<PropertyDescriptor>;
}
export interface EqualsOptions {
    partial?: boolean;
    throw?: boolean;
}
export declare class DocumentType implements CollectionType<any, any> {
    isSync: boolean;
    name: string;
    options: DocumentOptions;
    constructor(options?: DocumentOptions);
    updatedIsSync(): boolean;
    readSync(format: string, val: any): any;
    read(format: string, val: any): Promise<Dictionary<any>>;
    writeSync(format: string, val: Dictionary<any>): any;
    write(format: string, val: Dictionary<any>): Promise<any>;
    testSync(val: any): Error;
    test(val: any): Promise<Error>;
    normalizeSync(val: any): any;
    normalize(val: any): Promise<any>;
    equalsSync(val1: any, val2: any): boolean;
    equals(val1: any, val2: any, options?: EqualsOptions): Promise<boolean>;
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
