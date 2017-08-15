import {Incident} from "incident";
import {NotImplementedError} from "./_errors/not-implemented";
import {UnknownFormatError} from "./_errors/unknown-format";
import {lazyProperties} from "./_helpers/lazy-properties";
import {Lazy, SerializableType, VersionedType} from "./_interfaces";

export type Name = "literal";
export const name: Name = "literal";
export namespace bson {
  export type Input = any;
  export type Output = any;
}
export namespace json {
  export type Input = any;
  export type Output = any;
  export type Type = undefined;
}
export namespace qs {
  export type Input = any;
  export type Output = any;
}
export type Diff = any;

export interface Options<T, Output, Input extends Output, Diff> {
  type: VersionedType<any, Output, Input, Diff>;
  value: T;
}

export class LiteralType<T>
  implements VersionedType<T, json.Input, json.Output, Diff>,
    SerializableType<T, "bson", bson.Input, bson.Output>,
    SerializableType<T, "qs", qs.Input, qs.Output> {
  readonly name: Name = name;
  readonly type: VersionedType<T, any, any, Diff>;
  readonly value: T;

  private _options: Lazy<Options<T, any, any, any>>;

  constructor(options: Lazy<Options<T, any, any, any>>, lazy?: boolean) {
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
        ["min", "max"],
      );
    }
  }

  toJSON(): json.Type {
    throw NotImplementedError.create("LiteralType#toJSON");
  }

  readTrusted(format: "bson", val: bson.Output): T;
  readTrusted(format: "json", val: json.Output): T;
  readTrusted(format: "qs", val: qs.Output): T;
  readTrusted(format: "bson" | "json" | "qs", input: any): T {
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return this.type.readTrusted(<any> format, input);
  }

  read(format: "bson" | "json" | "qs", input: any): T {
    switch (format) {
      case "bson":
      case "json":
      case "qs":
        // TODO(demurgos): Check if the format is supported instead of casting to `any`
        return this.type.read(<any> format, input);
      default:
        throw UnknownFormatError.create(format);
    }
  }

  write(format: "bson", val: T): bson.Output;
  write(format: "json", val: T): json.Output;
  write(format: "qs", val: T): qs.Output;
  write(format: "bson" | "json" | "qs", val: T): any {
    // TODO(demurgos): Check if the format is supported instead of casting to `any`
    return this.type.write(<any> format, val);
  }

  testError(val: T): Error | undefined {
    const error: Error | undefined = this.type.testError(val);
    if (error !== undefined) {
      return error;
    }
    if (!this.type.equals(val, this.value)) {
      return Incident("InvalidLiteral", "Invalid literal value");
    }
    return undefined;
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return this.type.equals(val1, val2);
  }

  clone(val: T): T {
    return this.type.clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    throw NotImplementedError.create("LiteralType#diff");
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    throw NotImplementedError.create("LiteralType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("LiteralType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw NotImplementedError.create("LiteralType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options<T, any, any, any> = typeof this._options === "function" ? this._options() : this._options;

    const type: VersionedType<T, any, any, Diff> = options.type;
    const value: T = options.value;

    Object.assign(this, {type, value});
    Object.freeze(this);
  }
}

export {LiteralType as Type};
