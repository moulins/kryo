import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { IoType, Lazy, Reader, VersionedType, Writer } from "../core";
import { createLazyOptionsError } from "../errors/lazy-options";
import { testError } from "../test-error";

export type Name = "white-list";
export const name: Name = "white-list";
export type Diff = [number, number];

export interface WhiteListTypeOptions<T> {
  itemType: VersionedType<any, any>;
  values: T[];
}

export class WhiteListType<T> implements IoType<T>, VersionedType<T, Diff> {
  readonly name: Name = name;
  readonly itemType: VersionedType<any, any>;
  readonly values: T[];

  private _options: Lazy<WhiteListTypeOptions<T>>;

  constructor(options: Lazy<WhiteListTypeOptions<T>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.itemType = <any> undefined;
    this.values = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["itemType", "values"]);
    }
  }

  read<R>(reader: Reader<R>, raw: R): T {
    if (this.itemType.read === undefined) {
      throw new Incident("NotReadable", {type: this});
    }
    const result: T = this.itemType.read(reader, raw);
    for (const allowed of this.values) {
      if (this.itemType.equals(result, allowed)) {
        return result;
      }
    }
    throw Incident("UnkownVariant", "Unknown variant");
  }

  write<W>(writer: Writer<W>, value: T): W {
    if (this.itemType.write !== undefined) {
      return this.itemType.write(writer, value);
    } else {
      throw new Incident("NotWritable", {type: this});
    }
  }

  testError(val: T): Error | undefined {
    const error: Error | undefined = testError(this.itemType, val);
    if (error !== undefined) {
      return error;
    }
    for (const allowed of this.values) {
      if (this.itemType.equals(val, allowed)) {
        return undefined;
      }
    }
    return Incident("UnkownVariant", "Unknown variant");
  }

  test(value: T): boolean {
    if (!this.itemType.test(value)) {
      return false;
    }
    for (const allowed of this.values) {
      if (this.itemType.equals(value, allowed)) {
        return true;
      }
    }
    return false;
  }

  equals(val1: T, val2: T): boolean {
    return this.itemType.equals(val1, val2);
  }

  clone(val: T): T {
    return this.itemType.clone(val);
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return this.itemType.diff(oldVal, newVal);
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return this.itemType.patch(oldVal, diff);
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return this.itemType.reverseDiff(diff);
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    return this.itemType.squash(diff1, diff2);
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: WhiteListTypeOptions<T> = typeof this._options === "function" ? this._options() : this._options;

    const itemType: VersionedType<any, any> = options.itemType;
    const values: T[] = options.values;

    Object.assign(this, {itemType, values});
  }
}
