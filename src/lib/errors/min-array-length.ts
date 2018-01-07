import { Incident } from "incident";

export namespace MinArrayLengthError {
  export type Name = "MinArrayLength";
  export const name: Name = "MinArrayLength";
  export interface Data {
    array: ArrayLike<any>;
    min: number;
  }
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function format({array, min}: Data): string {
    return `Expected array length (${array.length}) to be greater than or equal to ${min}`;
  }
  export function create(array: ArrayLike<any>, min: number): Type {
    return Incident(name, {array, min}, format);
  }
}

export type MinArrayLengthError = MinArrayLengthError.Type;
