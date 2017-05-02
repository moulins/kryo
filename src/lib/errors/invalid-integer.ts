import {Incident} from "incident";

export namespace InvalidIntegerError {
  export type Name = "InvalidInteger";
  export const name: Name = "InvalidInteger";
  export interface Data {
    value: any;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({value}: Data): string {
    return `Invalid integer: ${value}`;
  }
  export function create(value: number): Type {
    return Incident(name, {value}, format);
  }
}

export type InvalidIntegerError = InvalidIntegerError.Type;

export default InvalidIntegerError;
