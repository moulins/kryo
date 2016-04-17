import * as Promise from "bluebird";
import { Dictionary, Document, Type, CollectionType, DocumentDiff, UpdateQuery } from "via-core";
import { ViaTypeError } from "./helpers/via-type-error";
export interface PropertyDescriptor {
    type?: Type<any, any>;
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
    constructor(errors: Dictionary<Error>);
}
export declare class DocumentType implements CollectionType<Document, DocumentDiff> {
    isSync: boolean;
    name: string;
    options: DocumentOptions;
    constructor(options?: DocumentOptions);
    updatedIsSync(): boolean;
    readTrustedSync(format: string, val: any): Document;
    readTrusted(format: string, val: any, opt: DocumentOptions): Promise<Document>;
    readSync(format: string, val: any): Document;
    read(format: string, val: any, opt: DocumentOptions): Promise<Document>;
    writeSync(format: string, val: Document, opt: DocumentOptions): any;
    write(format: string, val: Document, opt: DocumentOptions): Promise<any>;
    testSync(val: Document, options?: DocumentOptions): Error;
    test(val: Document, opt?: DocumentOptions): Promise<Error>;
    equalsSync(val1: Document, val2: Document): boolean;
    equals(val1: Document, val2: Document, options?: EqualsOptions): Promise<boolean>;
    cloneSync(val: Document): Document;
    clone(val: Document): Promise<Document>;
    diffSync(oldVal: Document, newVal: Document): DocumentDiff;
    diff(oldVal: Document, newVal: Document): Promise<DocumentDiff>;
    patchSync(oldVal: Document, diff: DocumentDiff): Document;
    patch(oldVal: Document, diff: DocumentDiff): Promise<Document>;
    revertSync(newVal: Document, diff: DocumentDiff): Document;
    revert(newVal: Document, diff: DocumentDiff): Promise<Document>;
    reflect(visitor: (value?: any, key?: string, parent?: CollectionType<any, any>) => any): any;
    reflectSync(visitor: (value?: any, key?: any, parent?: CollectionType<any, any>) => any): any;
    diffToUpdate(newVal: Document, diff: DocumentDiff, format: string): Promise<UpdateQuery>;
    static assignOptions(target: DocumentOptions, source: DocumentOptions): DocumentOptions;
    static cloneOptions(source: DocumentOptions): DocumentOptions;
    static mergeOptions(target: DocumentOptions, source: DocumentOptions): DocumentOptions;
    static keysDiff(subject: Document, reference: Document): KeyDiffResult;
}
