import { Incident } from "incident";

export namespace MissingKeysError {
  export type Name = "MissingKeys";
  export const name: Name = "MissingKeys";
  export interface Data {
    keys: string[];
  }
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function format({keys}: Data): string {
    return `Expected missing keys: ${JSON.stringify(keys)}`;
  }
  export function create(keys: string[]): Type {
    return Incident(name, {keys}, format);
  }
}

export type MissingKeysError = MissingKeysError.Type;
