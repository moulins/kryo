import { Incident } from "incident";

export namespace PatternNotMatchedError {
  export type Name = "PatternNotMatched";
  export const name: Name = "PatternNotMatched";
  export interface Data {
    string: string;
    pattern: RegExp;
  }
  export type Cause = undefined;
  export type Type = Incident<Data, Name, Cause>;
  export function format({pattern, string}: Data): string {
    return `The regular expression ${pattern} does not match the string ${JSON.stringify(string)}`;
  }
  export function create(pattern: RegExp, string: string): Type {
    return Incident(name, {pattern, string}, format);
  }
}

export type PatternNotMatchedError = PatternNotMatchedError.Type;
