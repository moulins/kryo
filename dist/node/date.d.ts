import { Type, TypeSync, StaticType } from "via-core";
import { ViaTypeError } from "./helpers/via-type-error";
export declare class DateTypeError extends ViaTypeError {
}
export declare class ReadJsonDateError extends DateTypeError {
    constructor(val: any);
}
export declare class NanTimestampError extends DateTypeError {
    constructor(date: Date);
}
export declare class DateTypeSync implements TypeSync<Date, number> {
    isSync: boolean;
    name: string;
    readTrustedSync(format: string, val: any): Date;
    readSync(format: string, val: any): Date;
    writeSync(format: string, val: Date): any;
    testSync(val: any): Error;
    equalsSync(val1: Date, val2: Date): boolean;
    cloneSync(val: Date): Date;
    diffSync(oldVal: Date, newVal: Date): number;
    patchSync(oldVal: Date, diff: number): Date;
    revertSync(newVal: Date, diff: number): Date;
}
export declare let DateType: StaticType<Date, number>;
export declare type DateType = Type<Date, number>;
