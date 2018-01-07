import { Incident } from "incident";

export type Name = "InvalidProperty";
export const name: Name = "InvalidProperty";

export interface Data {
  key: string;
  value: any;
}

export type Cause = undefined;
export type InvalidPropertyError = Incident<Data, Name, Cause>;

export function format({key, value}: Data): string {
  return `Invalid value ${value} for the property ${key}`;
}

export function createInvalidPropertyError(key: string, value: any): InvalidPropertyError {
  return Incident(name, {key, value}, format);
}
