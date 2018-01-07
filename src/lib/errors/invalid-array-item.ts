import { Incident } from "incident";

export type Name = "InvalidArrayItem";
export const name: Name = "InvalidArrayItem";

export interface Data {
  index: number;
  value: any;
}

export type Cause = undefined;
export type InvalidArrayItemError = Incident<Data, Name, Cause>;

export function format({index, value}: Data): string {
  return `Invalid value ${value} for the item at index ${index}`;
}

export function createInvalidArrayItemError(index: number, value: any): InvalidArrayItemError {
  return Incident(name, {index, value}, format);
}
