import { Incident } from "incident";

export namespace FiniteNumberError {
  export type Name = "FiniteNumber";
  export const name: Name = "FiniteNumber";
  export interface Data {
    value: number;
  }
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function format({value}: Data): string {
    return `Expected a finite number, received ${value}`;
  }
  export function create(value: number): Type {
    return Incident(name, {value}, format);
  }
}

export type FiniteNumberError = FiniteNumberError.Type;
