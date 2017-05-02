import {Incident} from "incident";

export namespace InvalidInt32Error {
  export type Name = "InvalidInt32";
  export const name: Name = "InvalidInt32";
  export interface Data {
    value: any;
    source?: any;
  }
  export type Cause = undefined;
  export type Type = Incident<Name, Data, Cause>;
  export function format({value, source}: Data): string {
    return `Invalid int32: ${value}` + (source === undefined ? "" : `, from ${source}`);
  }
  export function create(value: number, source?: any): Type {
    return Incident(name, {value, source}, format);
  }
}

export type InvalidIntegerError = InvalidInt32Error.Type;

export default InvalidIntegerError;
