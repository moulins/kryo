import * as Promise from "bluebird";
import { Dictionary, Document, Type, CollectionType, DocumentDiff } from "via-core";
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
export declare class DocumentType implements CollectionType<Document, DocumentDiff> {
    isSync: boolean;
    name: string;
    options: DocumentOptions;
    constructor(options?: DocumentOptions);
    updatedIsSync(): boolean;
    readSync(format: string, val: any): Document;
    read(format: string, val: any): Promise<Document>;
    writeSync(format: string, val: Document): any;
    write(format: string, val: Document): Promise<any>;
    testSync(val: Document): Error;
    test(val: Document): Promise<Error>;
    normalizeSync(val: Document): Document;
    normalize(val: Document): Promise<Document>;
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
}
