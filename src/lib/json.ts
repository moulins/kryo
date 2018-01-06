import { NotImplementedError } from "./_errors/not-implemented";
import { QsSerializer, VersionedType } from "./types";

export type Name = "json";
export const name: Name = "json";
export namespace json {
  export type Input = any;
  export type Output = any;
  // TODO(demurgos): Export arrayType to JSON
  export type Type = undefined;
}
export namespace qs {
  export type Input = any;
  export type Output = any;
}
export type Diff = any;

export class JsonType
  implements VersionedType<any, json.Input, json.Output, Diff>,
    QsSerializer<any, qs.Input, qs.Output> {
  readonly name: Name = name;

  constructor() {
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("ArrayType#toJSON");
  }

  readTrustedJson(input: json.Output): any {
    return input;
  }

  readTrustedQs(input: qs.Output): any {
    throw NotImplementedError.create("JsonType#readTrustedQs");
  }

  readJson(input: any): any {
    return JSON.parse(JSON.stringify(input));
  }

  readQs(input: any): any {
    throw NotImplementedError.create("JsonType#readQs");
  }

  writeJson(val: any): json.Output {
    return JSON.parse(JSON.stringify(val));
  }

  writeQs(val: any): qs.Output {
    throw NotImplementedError.create("JsonType#writeQs");
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
