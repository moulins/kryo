import { NotImplementedError } from "./_errors/not-implemented";
import { VersionedType } from "./types";

export type Name = "json";
export const name: Name = "json";
export namespace json {
  export type Input = any;
  export type Output = any;
  // TODO(demurgos): Export options to JSON
  export type Type = undefined;
}
export type Diff = any;

export class JsonType implements VersionedType<any, json.Input, json.Output, Diff> {
  readonly name: Name = name;

  constructor() {
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("ArrayType#toJSON");
  }

  readTrustedJson(input: json.Output): any {
    return input;
  }

  readJson(input: any): any {
    return JSON.parse(JSON.stringify(input));
  }

  writeJson(val: any): json.Output {
    return JSON.parse(JSON.stringify(val));
  }

  testError(val: any): Error | undefined {
    try {
      JSON.parse(JSON.stringify(val));
      return undefined;
    } catch (err) {
      return err;
    }
  }

  test(val: any): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: any, val2: any): boolean {
    return JSON.stringify(val1) === JSON.stringify(val2);
  }

  clone(val: any): any {
    return JSON.parse(JSON.stringify(val));
  }

  diff(oldVal: any, newVal: any): Diff | undefined {
    throw NotImplementedError.create("JsonType#diff");
  }

  patch(oldVal: any, diff: Diff | undefined): any {
    throw NotImplementedError.create("JsonType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("JsonType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("JsonType#squash");
  }
}

export { JsonType as Type };
