import { createNotImplementedError } from "../errors/not-implemented";
import { IoType, Reader, Writer } from "../types";

export namespace json {
  export type Type = undefined;
}
export type Diff = any;

export class AnyType<T = any> implements IoType<T> {
  constructor() {
  }

  toJSON(): json.Type {
    throw createNotImplementedError("AnyType#toJSON");
  }

  read<R>(reader: Reader<R>, raw: R): T {
    return <any> raw as T;
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: T): W {
    return writer.writeAny(value);
  }

  testError(value: T): Error | undefined {
    try {
      JSON.parse(JSON.stringify(value));
      return undefined;
    } catch (err) {
      return err;
    }
  }

  test(value: T): boolean {
    return true;
  }

  equals(val1: T, val2: T): boolean {
    // TODO: From arg
    return val1 === val2;
  }

  clone(val: T): T {
    return JSON.parse(JSON.stringify(val));
  }
}
