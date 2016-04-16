import { Type, TypeSync, StaticType } from "via-core";
export declare class BooleanTypeSync implements TypeSync<boolean, boolean> {
    isSync: boolean;
    name: string;
    readTrustedSync(format: string, val: any): boolean;
    readSync(format: string, val: any): boolean;
    writeSync(format: string, val: boolean): any;
    testSync(val: any): Error;
    equalsSync(val1: boolean, val2: boolean): boolean;
    cloneSync(val: boolean): boolean;
    diffSync(oldVal: boolean, newVal: boolean): boolean;
    patchSync(oldVal: boolean, diff: boolean): boolean;
    revertSync(newVal: boolean, diff: boolean): boolean;
}
export declare let BooleanType: StaticType<boolean, boolean>;
export declare type BooleanType = Type<boolean, boolean>;
