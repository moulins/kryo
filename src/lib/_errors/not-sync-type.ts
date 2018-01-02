import { Incident } from "incident";
import {Type as KryoType } from "../types";

export namespace NotSyncTypeError {
  export type Name = "NotSyncType";
  export const name: Name = "NotSyncType";
  export interface Data {
    type: KryoType<any>;
    methodName: string;
  }
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function format({type, methodName}: Data): string {
    return `The method ${methodName} of the type ${type}) is not supported`;
  }
  export function create(type: KryoType<any>, methodName: string): Type {
    return new Incident(name, {type, methodName}, format);
  }
}

export type NotSyncTypeError = NotSyncTypeError.Type;
