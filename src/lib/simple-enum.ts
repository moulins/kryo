import { Incident } from "incident";
import { NotImplementedError } from "./_errors/not-implemented";
import { WrongTypeError } from "./_errors/wrong-type";
import { lazyProperties } from "./_helpers/lazy-properties";
import { CaseStyle, rename } from "./_helpers/rename";
import { Lazy, QsSerializer, VersionedType } from "./types";

export type SimpleEnum<EnumConstructor> = {[K in keyof EnumConstructor]: EnumConstructor[K]};

interface ReversedEnum<EC> {
  [index: number]: (keyof EC) | undefined;
}

type DoubleEnum<EC> = SimpleEnum<EC> & ReversedEnum<EC>;

export interface AnySimpleEnum {
  [name: string]: number;
}

export interface AnyReversedEnum {
  [value: number]: string;
}

type AnyDoubleEnum = AnySimpleEnum & AnyReversedEnum;

// This is strictly an alias for `number` for the moment since Typescript
// does not use union types for enum values (as of TS 2.3)
export interface EnumConstructor<EnumValue extends number> {
  [name: string]: EnumValue;
}

export type Name = "simple-enum";
export const name: Name = "simple-enum";
export namespace bson {
  export type Input = string;
  export type Output = string;
}
export namespace json {
  export type Input = string;
  export type Output = string;

  export interface Type {
    name: Name;
    enum: EnumConstructor<number>;
  }
}
export namespace qs {
  export type Input = string;
  export type Output = string;
}
export type Diff = number;

export interface Options<E extends number> {
  enum: EnumConstructor<E> | Object;
  rename?: CaseStyle;
}

/**
 * Supports enums from keys that are valid Javascript identifiers to unique integer values
 */
export class SimpleEnumType<E extends number>
  implements VersionedType<E, json.Input, json.Output, Diff>,
    QsSerializer<E, qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly enum: EnumConstructor<E>;
  readonly rename?: CaseStyle;
  readonly outputNameToValue: AnySimpleEnum;
  readonly valueToOutputName: AnyReversedEnum;

  private _options: Lazy<Options<E>>;

  constructor(options: Lazy<Options<E>>, lazy?: boolean) {
    this._options = options;
    if (lazy === undefined) {
      lazy = typeof options === "function";
    }
    if (!lazy) {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["enum", "rename", "outputNameToValue", "valueToOutputName"],
      );
    }
  }

  static fromJSON(): SimpleEnumType<any> {
    throw NotImplementedError.create("SimpleEnumType.fromJSON");
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("SimpleEnumType#toJSON");
  }

  readTrustedJson(input: json.Output): E {
    return this.outputNameToValue[input] as E;
  }

  readTrustedQs(input: qs.Output): E {
    return this.outputNameToValue[input] as E;
  }

  readJson(input: any): E {
    if (typeof input !== "string") {
      throw WrongTypeError.create("string", input);
    }
    if (!this.outputNameToValue.hasOwnProperty(input)) {
      throw Incident("Unknown enum variant name", input);
    }
    return this.outputNameToValue[input] as E;
  }

  readQs(input: any): E {
    if (typeof input !== "string") {
      throw WrongTypeError.create("string", input);
    }
    if (!this.outputNameToValue.hasOwnProperty(input)) {
      throw Incident("Unknown enum variant name", input);
    }
    return this.outputNameToValue[input] as E;
  }

  writeJson(val: E): json.Output {
    return this.valueToOutputName[val as number];
  }

  writeQs(val: E): qs.Output {
    return this.valueToOutputName[val as number];
  }

  testError(val: E): Error | undefined {
    if (typeof val !== "number") {
      return WrongTypeError.create("number", val);
    }
    // TODO(demurgos): Remove <number> once typedoc supports it
    if (isNaN(val) || val === Infinity || val === -Infinity || (<number> val | 0) !== val) {
      return WrongTypeError.create("int32", val);
    }
    if (!this.enum.hasOwnProperty(val)) {
      return Incident("UnknownVariantError", {value: val}, "Unknown enum variant value");
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
    /* tslint:disable-next-line:strict-boolean-expressions */
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

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options<E> = typeof this._options === "function" ? this._options() : this._options;

    const baseEnum: EnumConstructor<E> = <any> options.enum;
    const renameAll: CaseStyle | undefined = options.rename;
    const outputNameToValue: AnySimpleEnum = {};
    const valueToOutputName: AnyReversedEnum = {};

    for (const key in baseEnum) {
      if (/^\d+$/.test(key)) {
        continue;
      }
      const value: number = (<{[name: string]: number}> options.enum)[key];
      if (typeof value !== "number") {
        throw WrongTypeError.create("number", value);
      }
      if (!baseEnum.hasOwnProperty(value) || !baseEnum.hasOwnProperty(value)) {
        throw new Incident("NotSimpleEnum", "Not owned key or value");
      }
      if ((<any> baseEnum[value] as string) !== key) {
        throw new Incident("NotReversibleEnum", "enum[enum[key]] !== key");
      }
      let renamed: string;
      if (renameAll === undefined) {
        renamed = key;
      } else {
        renamed = rename(key, renameAll);
      }
      outputNameToValue[renamed] = value;
      valueToOutputName[value] = renamed;
    }

    Object.assign(this, {enum: baseEnum, rename: renameAll, outputNameToValue, valueToOutputName});
    Object.freeze(this);
  }
}

export { SimpleEnumType as Type };
