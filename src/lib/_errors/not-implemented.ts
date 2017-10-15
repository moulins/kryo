import { Incident } from "incident";

export namespace NotImplementedError {
  export type Name = "NotImplemented";
  export const name: Name = "NotImplemented";
  export interface Data {}
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function create(message: string): Type {
    return Incident(name, message);
  }
}

export type NotImplementedError = NotImplementedError.Type;
