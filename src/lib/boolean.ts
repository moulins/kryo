import { WrongTypeError } from "./_errors/wrong-type";
import { BsonSerializer, QsSerializer, VersionedType } from "./types";

export type Name = "boolean";
export const name: Name = "boolean";
export type T = boolean;
export namespace bson {
  export type Input = boolean;
  export type Output = boolean;
}
export namespace json {
  export type Input = boolean;
  export type Output = boolean;
}
export namespace qs {
  export type Input = "true" | "false";
  export type Output = "true" | "false";
}
export type Diff = boolean;

export class BooleanType
  implements VersionedType<T, json.Input, json.Output, Diff>,
    BsonSerializer<T, bson.Input, bson.Output>,
    QsSerializer<T, qs.Input, qs.Output> {
  readonly name: Name = name;

  toJSON(): undefined {
    /* tslint:disable-next-line:return-undefined */
    return undefined;
  }

  readTrustedJson(input: json.Output): T {
    return input;
  }

  readTrustedBson(input: bson.Output): T {
    return input;
  }

  readTrustedQs(input: qs.Output): T {
    return input === "true";
  }

  readJson(input: any): T {
    if (typeof input !== "boolean") {
      throw WrongTypeError.create("boolean", input);
    }
    return input;
  }

  readBson(input: any): T {
    if (typeof input !== "boolean") {
      throw WrongTypeError.create("boolean", input);
    }
    return input;
  }

  readQs(input: any): T {
    if (!(input === "true" || input === "false")) {
      throw WrongTypeError.create("\"true\" | \"false\"", input);
    }
    return input === "true";
  }

  writeJson(val: T): json.Output {
    return val;
  }

  writeBson(val: T): bson.Output {
    return val;
  }

  writeQs(val: T): qs.Output {
    return val ? "true" : "false";
  }

  testError(val: T): Error | undefined {
    if (typeof val !== "boolean") {
      return WrongTypeError.create("boolean", val);
    }
    return undefined;
  }

  test(val: T): val is T {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: T, newVal: T): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return (oldVal !== newVal) || undefined;
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return oldVal === (diff === undefined);
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    /* tslint:disable-next-line:strict-boolean-expressions */
    return (diff1 !== diff2) && undefined;
  }
}

export { BooleanType as Type };
