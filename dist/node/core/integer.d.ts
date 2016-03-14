import { Type, TypeSync, StaticType } from "./interfaces/type";
export declare class IntegerTypeSync implements TypeSync<number, number> {
    isSync: boolean;
    name: string;
    readSync(format: string, val: any): number;
    writeSync(format: string, val: number): any;
    testSync(val: any): Error;
    normalizeSync(val: any): number;
    equalsSync(val1: number, val2: number): boolean;
    cloneSync(val: number): number;
    diffSync(oldVal: number, newVal: number): number;
    patchSync(oldVal: number, diff: number): number;
    revertSync(newVal: number, diff: number): number;
}
export declare let IntegerType: StaticType<number, number>;
export declare type IntegerType = Type<number, number>;
