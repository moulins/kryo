import { Incident } from "incident";
import { InvalidArrayItemError } from "./_errors/invalid-array-item";
import { MaxArrayLengthError } from "./_errors/max-array-length";
import { NotImplementedError } from "./_errors/not-implemented";
import { UnknownFormatError } from "./_errors/unknown-format";
import { WrongTypeError } from "./_errors/wrong-type";
import { lazyProperties } from "./_helpers/lazy-properties";
import { Lazy, SerializableType, VersionedType } from "./types";

export type Name = "json";
export const name: Name = "json";
export namespace bson {
  export type Input = any;
  export type Output = any;
}
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
    SerializableType<any, "bson", bson.Input, bson.Output>,
    SerializableType<any, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;

  constructor() {
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("ArrayType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): any;
  readTrusted(format: "json", val: json.Output): any;
  readTrusted(format: "qs", val: qs.Output): any;
  readTrusted(format: "bson" | "json" | "qs", input: any): any {
    switch (format) {
      case "bson":
      case "json":
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        return input;
      case "qs":
        throw NotImplementedError.create("JsonType#readTrusted('qs', ...)");
      default:
        return undefined as never;
    }
  }

  read(format: "bson" | "json" | "qs", input: any): any {
    switch (format) {
      case "bson":
      case "json":
        return JSON.parse(JSON.stringify(input));
      case "qs":
        throw NotImplementedError.create("JsonType#read('qs', ...)");
      default:
        throw UnknownFormatError.create(format);
    }
  }

  write(format: "bson", val: any): bson.Output;
  write(format: "json", val: any): json.Output;
  write(format: "qs", val: any): qs.Output;
  write(format: "bson" | "json" | "qs", val: any): any {
    switch (format) {
      case "bson":
      case "json":
        return JSON.parse(JSON.stringify(val));
      case "qs":
        throw NotImplementedError.create("JsonType#write('qs', ...)");
      default:
        return undefined as never;
    }
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

export {JsonType as Type};
