import {Incident} from "incident";
import {type} from "via-core";

export class ViaTypeError extends Incident {}

export class UnsupportedFormatError extends ViaTypeError {
  constructor (format: string) {
    super(null, "UnsupportedFormat", {format: format}, `Unsupported format ${format}`);
  }
}

export class UnexpectedTypeError extends ViaTypeError {
  constructor (actualTypeName: string, expectedTypeName: string) {
    super(null, "UnexpectedType", {actualType: actualTypeName, expectedType: expectedTypeName}, `Expected type ${expectedTypeName}, received ${actualTypeName}`);
  }
}

export class UnavailableSyncError extends ViaTypeError {
  constructor (type: type.Type<any, any, any>, methodName: string) {
    super(null, "UnexpectedType", {type: methodName, methodName: methodName}, `Synchronous ${methodName} for ${type.type} is not available`);
  }
}
