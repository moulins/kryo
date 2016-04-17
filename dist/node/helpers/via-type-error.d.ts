import { Incident } from "incident";
import { Type } from "via-core";
export declare class ViaTypeError extends Incident {
}
export declare class UnsupportedFormatError extends ViaTypeError {
    constructor(format: string);
}
export declare class UnexpectedTypeError extends ViaTypeError {
    constructor(actualTypeName: string, expectedTypeName: string);
}
export declare class UnavailableSyncError extends ViaTypeError {
    constructor(type: Type<any, any>, methodName: string);
}
