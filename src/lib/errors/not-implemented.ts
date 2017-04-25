import {Incident} from "incident";

/* tslint:disable-next-line:no-namespace */
export namespace NotImplementedError {
  export type Name = "NotImplemented";
  export const name: Name = "NotImplemented";
  export interface Data {}
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function create(message: string): Type {
    return Incident(name, message);
  }
}

export type NotImplementedError = NotImplementedError.Type;
