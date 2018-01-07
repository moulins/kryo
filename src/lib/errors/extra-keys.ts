import { Incident } from "incident";

export type Name = "ExtraKeys";
export const name: Name = "ExtraKeys";

export interface Data {
  keys: string[];
}

export type Cause = undefined;
export type ExtraKeysError = Incident<Data, Name, Cause>;

export function format({keys}: Data): string {
  return `Unexpected extra keys: ${JSON.stringify(keys)}`;
}

export function createExtraKeysError(keys: string[]): ExtraKeysError {
  return Incident(name, {keys}, format);
}
