import { Incident } from "incident";

export type Name = "MissingKeys";
export const name: Name = "MissingKeys";

export interface Data {
  keys: string[];
}

export type Cause = undefined;
export type MissingKeysError = Incident<Data, Name, Cause>;

export function format({keys}: Data): string {
  return `Expected missing keys: ${JSON.stringify(keys)}`;
}

export function createMissingKeysError(keys: string[]): MissingKeysError {
  return Incident(name, {keys}, format);
}
