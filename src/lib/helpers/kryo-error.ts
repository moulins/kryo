import {Incident} from "incident";
import {Type} from "kryo-core";

export class KryoError<D> extends Incident<D> {}

export interface UnsupportedFormatErrorData {
  format: string;
}

export class UnsupportedFormatError extends KryoError<UnsupportedFormatErrorData> {
  constructor (format: string) {
    super(
      "UnsupportedFormat",
      {format: format},
      `Unsupported format ${format}`
    );
  }
}

export interface UnexpectedTypeErrorData {

}

export class UnexpectedTypeError extends KryoError<UnexpectedTypeErrorData> {
  constructor (actualTypeName: string, expectedTypeName: string) {
    super(
      "UnexpectedType",
      {actualType: actualTypeName, expectedType: expectedTypeName},
      `Expected type ${expectedTypeName}, received ${actualTypeName}`
    );
  }
}

export interface UnavailableSyncErrorData {
  type: Type<any, any, any>;
  methodName: string;
}

export class UnavailableSyncError extends KryoError<UnavailableSyncErrorData> {
  constructor (type: Type<any, any, any>, methodName: string) {
    super(
      "UnavailableSync",
      {type: type, methodName: methodName},
      `Synchronous ${methodName} for ${type.type} is not available`
    );
  }
}

export interface TodoErrorData {
  message: string;
}

export class TodoError extends Incident<TodoErrorData> {
  constructor (message: string) {
    super(
      "todo",
      {message: message},
      message
    );
  }
}
