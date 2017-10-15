import { Incident } from "incident";

export namespace MinCodepointsError {
  export type Name = "MinCodepoints";
  export const name: Name = "MinCodepoints";
  export interface Data {
    string: string;
    count: number;
    min: number;
  }
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function format({count, min}: Data): string {
    return `Expected codepoints count (${count}) to be greater than or equal to ${min}`;
  }
  export function create(string: string, count: number, min: number): Type {
    return Incident(name, {string, count, min}, format);
  }
}

export type MinCodepointsError = MinCodepointsError.Type;
