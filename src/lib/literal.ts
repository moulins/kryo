import { Incident } from "incident";
import { NotImplementedError } from "./_errors/not-implemented";
import { lazyProperties } from "./_helpers/lazy-properties";
import { Lazy, QsSerializer, VersionedType } from "./types";

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
    QsSerializer<T, qs.Input, qs.Output> {
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

  readTrustedJson(input: json.Output): T {
    return this.type.readTrustedJson(input);
  }

  readTrustedQs(input: qs.Output): T {
    // TODO(demurgos): Avoid casting
    return (<any> this.type as QsSerializer<T>).readTrustedQs(input);
  }

  readJson(input: any): T {
    return this.type.readJson(input);
  }

  readQs(input: any): T {
    // TODO(demurgos): Avoid casting
    return (<any> this.type as QsSerializer<T>).readQs(input);
  }

  writeJson(val: T): json.Output {
    return this.type.writeJson(val);
  }

  writeQs(val: T): qs.Output {
    // TODO(demurgos): Avoid casting
    return (<any> this.type as QsSerializer<T>).writeQs(val);
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

export { LiteralType as Type };
