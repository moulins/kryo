import {Incident} from "incident";
import {NotImplementedError} from "../errors/not-implemented";
import {WrongTypeError} from "../errors/wrong-type";
import {VersionedType} from "../interfaces";

export type SimpleEnum<EnumConstructor> = {
  [K in keyof EnumConstructor]: EnumConstructor[K];
};

interface ReversedEnum<EC> {
  [index: number]: (keyof EC) | undefined;
}

type DoubleEnum<EC> = SimpleEnum<EC> & ReversedEnum<EC>;

type AnyDoubleEnum = {
  [name: string]: number;
} & {
  [value: number]: string;
};

// This is strictly an alias for `number` for the moment since Typescript
// does not use union types for enum values (as of TS 2.3)
export interface EnumConstructor<EnumValue extends number> {
  [name: string]: EnumValue;
}

export type Name = "simple-enum";
export const name: Name = "simple-enum";
/* tslint:disable-next-line:no-namespace */
export namespace json {
  export type Input = string;
  export type Output = string;
  export interface Type {
    name: Name;
    enum: EnumConstructor<number>;
  }
}
export type Diff = number;

/**
 * Supports enums from keys that are valid Javascript identifiers to unique integer values
 */
export class SimpleEnumType<E extends number> implements VersionedType<E, json.Input, json.Output, Diff> {
  static fromJSON(): SimpleEnumType<any> {
    throw NotImplementedError.create("SimpleEnumType.fromJSON");
  }

  readonly name: Name = name;
  readonly enum: EnumConstructor<E> & Object;

  constructor(e: EnumConstructor<E> | Object) {
    this.enum = e as EnumConstructor<E> & Object;
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("SimpleEnumType#toJSON");
  }

  readTrusted(format: "json" | "bson", val: json.Output): E {
    return this.enum[val]!;
  }

  read(format: "json" | "bson", val: any): E {
    if (typeof val !== "string") {
      throw WrongTypeError.create("string", val);
    }
    if (!this.enum.hasOwnProperty(val)) {
      throw Incident("Unknown enum variant name", val);
    }
    return this.enum[val];
  }

  write(format: "json" | "bson", val: E): json.Output {
    return (<any> this.enum as AnyDoubleEnum)[val as number]!;
  }

  testError(val: E): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    if (isNaN(val) || val === Infinity || val === -Infinity || (val | 0) !== val) {
      return WrongTypeError.create("int32", val);
    }
    if (!this.enum.hasOwnProperty(val)) {
      return Incident("Unknown enum variant value", val);
    }
    return undefined;
  }

  test(val: E): val is E {
    return typeof val === "number" && this.enum.hasOwnProperty(val);
  }

  equals(val1: E, val2: E): boolean {
    return val1 === val2;
  }

  clone(val: E): E {
    return val;
  }

  diff(oldVal: E, newVal: E): Diff | undefined {
    return newVal === oldVal ? undefined : <number> newVal - <number> oldVal;
  }

  patch(oldVal: E, diff: Diff | undefined): E {
    return diff === undefined ? oldVal : <number> oldVal + diff as E;
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff && -diff;
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2;
    } else if (diff2 === undefined) {
      return diff1;
    }
    return diff2 === -diff1 ? undefined : diff1 + diff2;
  }
}

export {SimpleEnumType as Type};
