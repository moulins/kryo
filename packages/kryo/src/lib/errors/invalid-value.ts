import incident from "incident";

import { Type } from "../core";

export type Name = "InvalidValue";
export const name: Name = "InvalidValue";

export interface Data {
  type: Type<any>;
  value: any;
}

export type Cause = undefined;
export type InvalidValueError = incident.Incident<Data, Name, Cause>;

export function createInvalidValueError(type: Type<any>, value: any): InvalidValueError {
  return new incident.Incident(name, {type, value});
}