import * as Promise from "bluebird";
import { utils, type } from "via-core";
import { ViaTypeError } from "./helpers/via-type-error";
export interface PropertyDescriptor {
    type?: type.Type<any, any>;
    optional?: boolean;
    nullable?: boolean;
}
export interface DocumentOptions {
    additionalProperties?: boolean;
    properties?: utils.Dictionary<PropertyDescriptor>;
}
export interface EqualsOptions {
    partial?: boolean;
    throw?: boolean;
}
export interface KeyDiffResult {
    commonKeys: string[];
    missingKeys: string[];
    extraKeys: string[];
}
export declare class DocumentTypeError extends ViaTypeError {
}
export declare class MissingKeysError extends DocumentTypeError {
    constructor(keys: string[]);
}
export declare class ExtraKeysError extends DocumentTypeError {
    constructor(keys: string[]);
}
export declare class ForbiddenNullError extends DocumentTypeError {
    constructor(propertyName: string);
}
export declare class PropertiesTestError extends DocumentTypeError {
    constructor(errors: utils.Dictionary<Error>);
}
export declare class DocumentType implements type.CollectionType<utils.Document, type.DocumentDiff> {
    isSync: boolean;
    name: string;
    options: DocumentOptions;
    constructor(options?: DocumentOptions);
    updatedIsSync(): boolean;
    readTrustedSync(format: string, val: any): utils.Document;
    readTrusted(format: string, val: any, opt: DocumentOptions): Promise<utils.Document>;
    readSync(format: string, val: any): utils.Document;
    read(format: string, val: any, opt: DocumentOptions): Promise<utils.Document>;
    writeSync(format: string, val: utils.Document, opt: DocumentOptions): any;
    write(format: string, val: utils.Document, opt: DocumentOptions): Promise<any>;
    testSync(val: utils.Document, options?: DocumentOptions): Error;
    test(val: utils.Document, opt?: DocumentOptions): Promise<Error>;
    equalsSync(val1: utils.Document, val2: utils.Document): boolean;
    equals(val1: utils.Document, val2: utils.Document, options?: EqualsOptions): Promise<boolean>;
    cloneSync(val: utils.Document): utils.Document;
    clone(val: utils.Document): Promise<utils.Document>;
    diffSync(oldVal: utils.Document, newVal: utils.Document): type.DocumentDiff;
    diff(oldVal: utils.Document, newVal: utils.Document): Promise<type.DocumentDiff>;
    patchSync(oldVal: utils.Document, diff: type.DocumentDiff): utils.Document;
    patch(oldVal: utils.Document, diff: type.DocumentDiff): Promise<utils.Document>;
    revertSync(newVal: utils.Document, diff: type.DocumentDiff): utils.Document;
    revert(newVal: utils.Document, diff: type.DocumentDiff): Promise<utils.Document>;
    reflect(visitor: (value?: any, key?: string, parent?: type.CollectionType<any, any>) => any): any;
    reflectSync(visitor: (value?: any, key?: any, parent?: type.CollectionType<any, any>) => any): any;
    diffToUpdate(newVal: utils.Document, diff: type.DocumentDiff, format: string): Promise<type.UpdateQuery>;
    static assignOptions(target: DocumentOptions, source: DocumentOptions): DocumentOptions;
    static cloneOptions(source: DocumentOptions): DocumentOptions;
    static mergeOptions(target: DocumentOptions, source: DocumentOptions): DocumentOptions;
    static keysDiff(subject: utils.Document, reference: utils.Document): KeyDiffResult;
}
