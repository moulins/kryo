import { Incident } from "incident";
import { type } from "via-core";
export declare class ViaTypeError extends Incident {
}
export declare class UnsupportedFormatError extends ViaTypeError {
    constructor(format: string);
}
export declare class UnexpectedTypeError extends ViaTypeError {
    constructor(actualTypeName: string, expectedTypeName: string);
}
export declare class UnavailableSyncError extends ViaTypeError {
    constructor(type: type.Type<any, any>, methodName: string);
}
