import { TypeSync, StaticType } from "via-core";
export interface StringOptions {
    regex?: RegExp;
    lowerCase?: boolean;
    trimmed?: boolean;
    minLength?: number;
    maxLength?: number;
}
export declare class StringTypeSync implements TypeSync<string, string[]> {
    isSync: boolean;
    name: string;
    options: StringOptions;
    constructor(options: StringOptions);
    readSync(format: string, val: any): string;
    writeSync(format: string, val: string): any;
    testSync(val: any): Error;
    normalizeSync(val: any): string;
    equalsSync(val1: string, val2: string): boolean;
    cloneSync(val: string): string;
    diffSync(oldVal: string, newVal: string): string[];
    patchSync(oldVal: string, diff: string[]): string;
    revertSync(newVal: string, diff: string[]): string;
}
export declare let StringType: StaticType<string, string[]>;
