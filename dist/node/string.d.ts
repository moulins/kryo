import { TypeSync, StaticType } from "via-core";
import { ViaTypeError } from "./helpers/via-type-error";
export declare class StringTypeError extends ViaTypeError {
}
export declare class LowerCaseError extends StringTypeError {
    constructor(string: string);
}
export declare class TrimError extends StringTypeError {
    constructor(string: string);
}
export declare class PatternError extends StringTypeError {
    constructor(string: string, pattern: RegExp);
}
export declare class MinLengthError extends StringTypeError {
    constructor(string: string, minLength: number);
}
export declare class MaxLengthError extends StringTypeError {
    constructor(string: string, maxLength: number);
}
export interface StringOptions {
    regex?: RegExp;
    lowerCase?: boolean;
    trimmed?: boolean;
    minLength?: number;
    maxLength?: number;
    looseTest?: boolean;
}
export declare class StringTypeSync implements TypeSync<string, string[]> {
    isSync: boolean;
    name: string;
    options: StringOptions;
    constructor(options?: StringOptions);
    readTrustedSync(format: string, val: any): string;
    readSync(format: string, val: any): string;
    writeSync(format: string, val: string): any;
    testSync(val: any, opt?: StringOptions): Error;
    equalsSync(val1: string, val2: string): boolean;
    cloneSync(val: string): string;
    diffSync(oldVal: string, newVal: string): string[];
    patchSync(oldVal: string, diff: string[]): string;
    revertSync(newVal: string, diff: string[]): string;
    static assignOptions(target: StringOptions, source: StringOptions): StringOptions;
    static cloneOptions(source: StringOptions): StringOptions;
    static mergeOptions(target: StringOptions, source: StringOptions): StringOptions;
}
export declare let StringType: StaticType<string, string[]>;
