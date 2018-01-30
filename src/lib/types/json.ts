import { createNotImplementedError } from "../errors/not-implemented";
import { JsonValue } from "../json-value";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Reader, VersionedType, Writer } from "../types";

export type Name = "json";
export const name: Name = "json";
export namespace json {
  export type Input = any;
  export type Output = any;
  // TODO(demurgos): Export options to JSON
  export type Type = undefined;
}
export type Diff = any;

export class JsonType implements IoType<JsonValue>, VersionedType<JsonValue, Diff> {
  readonly name: Name = name;

  constructor() {
  }

  toJSON(): json.Type {
    throw createNotImplementedError("ArrayType#toJSON");
  }

  read<R>(reader: Reader<R>, raw: R): JsonValue {
    return reader.readAny(raw, readVisitor<any>({
      fromBoolean: input => input,
      fromFloat64: input => input,
      fromNull: () => null,
      fromString: input => input,
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: JsonValue): W {
    return writer.writeJson(value);
  }

  testError(value: JsonValue): Error | undefined {
    try {
      JSON.parse(JSON.stringify(value));
      return undefined;
    } catch (err) {
      return err;
    }
  }

  test(value: JsonValue): boolean {
    return this.testError(value) === undefined;
  }

  equals(val1: JsonValue, val2: JsonValue): boolean {
    // TODO: Use deep equality: the current implementation is order-dependent.
    return JSON.stringify(val1) === JSON.stringify(val2);
  }

  clone(val: JsonValue): JsonValue {
    return JSON.parse(JSON.stringify(val));
  }

  diff(oldVal: JsonValue, newVal: JsonValue): Diff | undefined {
    throw createNotImplementedError("JsonType#diff");
  }

  patch(oldVal: JsonValue, diff: Diff | undefined): JsonValue {
    throw createNotImplementedError("JsonType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("JsonType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("JsonType#squash");
  }
}
