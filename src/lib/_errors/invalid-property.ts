import { Incident } from "incident";

export namespace InvalidPropertyError {
  export type Name = "InvalidProperty";
  export const name: Name = "InvalidProperty";
  export interface Data {
    key: string;
    value: any;
  }
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function format({key, value}: Data): string {
    return `Invalid value ${value} for the property ${key}`;
  }
  export function create(key: string, value: any): Type {
    return Incident(name, {key, value}, format);
  }
}

export type InvalidPropertyError = InvalidPropertyError.Type;
