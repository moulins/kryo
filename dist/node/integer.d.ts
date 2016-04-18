import { type } from "via-core";
import { ViaTypeError } from "./helpers/via-type-error";
export declare class IntegerTypeError extends ViaTypeError {
}
export declare class NumericError extends IntegerTypeError {
    constructor(value: number);
}
export declare class IntegerTypeSync implements type.TypeSync<number, number> {
    isSync: boolean;
    name: string;
    readTrustedSync(format: string, val: any): number;
    readSync(format: string, val: any): number;
    writeSync(format: string, val: number): any;
    testSync(val: any): Error;
    equalsSync(val1: number, val2: number): boolean;
    cloneSync(val: number): number;
    diffSync(oldVal: number, newVal: number): number;
    patchSync(oldVal: number, diff: number): number;
    revertSync(newVal: number, diff: number): number;
}
export declare let IntegerType: type.StaticType<number, number>;
export declare type IntegerType = type.Type<number, number>;
