import { createInvalidTypeError } from "../errors/invalid-type";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Reader, VersionedType, Writer } from "../types";

export type Name = "null";
export const name: Name = "null";
export namespace json {
  export type Input = null;
  export type Output = null;

  export interface Type {
    name: Name;
  }
}

export class NullType implements IoType<null>, VersionedType<null, undefined> {
  readonly name: Name = name;

  toJSON(): json.Type {
    return {name};
  }

  read<R>(reader: Reader<R>, raw: R): null {
    return reader.readNull(raw, readVisitor({
      fromNull: () => null,
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: null): W {
    return writer.writeNull();
  }

  testError(val: null): Error | undefined {
    if (val !== null) {
      return createInvalidTypeError("null", val);
    }
    return undefined;
  }

  test(val: null): val is null {
    return val === null;
  }

  equals(val1: null, val2: null): boolean {
    return val1 === val2;
  }

  clone(val: null): null {
    return val;
  }

  /**
   * @param oldVal
   * @param newVal
   * @returns `true` if there is a difference, `undefined` otherwise
   */
  diff(oldVal: null, newVal: null): undefined {
    return;
  }

  patch(oldVal: null, diff: undefined): null {
    return null;
  }

  reverseDiff(diff: undefined): undefined {
    return;
  }

  squash(diff1: undefined, diff2: undefined): undefined {
    return;
  }
}
