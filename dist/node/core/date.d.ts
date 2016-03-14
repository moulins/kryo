import { Type, TypeSync, StaticType } from "./interfaces/type";
export declare class DateTypeSync implements TypeSync<Date, number> {
    isSync: boolean;
    name: string;
    readSync(format: string, val: any): Date;
    writeSync(format: string, val: Date): any;
    testSync(val: any): Error;
    normalizeSync(val: any): Date;
    equalsSync(val1: Date, val2: Date): boolean;
    cloneSync(val: Date): Date;
    diffSync(oldVal: Date, newVal: Date): number;
    patchSync(oldVal: Date, diff: number): Date;
    revertSync(newVal: Date, diff: number): Date;
}
export declare let DateType: StaticType<Date, number>;
export declare type DateType = Type<Date, number>;
