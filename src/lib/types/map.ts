import { Incident } from "incident";
import { lazyProperties } from "../_helpers/lazy-properties";
import { createInvalidTypeError } from "../errors/invalid-type";
import { createLazyOptionsError } from "../errors/lazy-options";
import { createNotImplementedError } from "../errors/not-implemented";
import { readVisitor } from "../readers/read-visitor";
import { IoType, Lazy, Reader, VersionedType, Writer } from "../types";

export type Name = "map";
export const name: Name = "map";
export type Diff = any;

export interface MapTypeOptions<K, V> {
  keyType: VersionedType<K, any>;
  valueType: VersionedType<V, any>;
  maxSize: number;
  assumeStringKey?: boolean;
}

export class MapType<K, V> implements IoType<Map<K, V>>, VersionedType<Map<K, V>, Diff> {
  readonly name: Name = name;
  readonly keyType: VersionedType<K, any>;
  readonly valueType: VersionedType<V, any>;
  readonly maxSize: number;
  readonly assumeStringKey: boolean;

  private _options: Lazy<MapTypeOptions<K, V>>;

  constructor(options: Lazy<MapTypeOptions<K, V>>) {
    // TODO: Remove once TS 2.7 is better supported by editors
    this.keyType = <any> undefined;
    this.valueType = <any> undefined;
    this.maxSize = <any> undefined;
    this.assumeStringKey = <any> undefined;

    this._options = options;
    if (typeof options !== "function") {
      this._applyOptions();
    } else {
      lazyProperties(this, this._applyOptions, ["keyType", "valueType", "maxSize", "assumeStringKey"]);
    }
  }

  // TODO: Dynamically add with prototype?
  read<R>(reader: Reader<R>, raw: R): Map<K, V> {
    return reader.readMap(raw, readVisitor({
      fromMap: <RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): Map<K, V> => {
        const result: Map<K, V> = new Map();
        for (const [rawKey, rawValue] of input) {
          const key: K = this.keyType.read!(keyReader, rawKey);
          const value: V = this.valueType.read!(valueReader, rawValue);
          result.set(key, value);
        }
        const error: Error | undefined = this.testError(result);
        if (error !== undefined) {
          throw error;
        }
        return result;
      },
    }));
  }

  // TODO: Dynamically add with prototype?
  write<W>(writer: Writer<W>, value: Map<K, V>): W {
    const entries: [K, V][] = [...value];

    return writer.writeMap(
      entries.length,
      <KW>(index: number, keyWriter: Writer<KW>): KW => {
        if (this.keyType.write === undefined) {
          throw new Incident("NotWritable", {type: this.keyType});
        }
        return this.keyType.write(keyWriter, entries[index][0]);
      },
      <VW>(index: number, valueWriter: Writer<VW>): VW => {
        if (this.valueType.write === undefined) {
          throw new Incident("NotWritable", {type: this.valueType});
        }
        return this.valueType.write(valueWriter, entries[index][1]);
      },
    );
  }

  testError(val: Map<K, V>): Error | undefined {
    if (!(val instanceof Map)) {
      return createInvalidTypeError("Map", val);
    }
    for (const [key, value] of val) {
      // TODO: test keyType
      const keyError: Error | undefined = this.keyType.testError(key);
      if (keyError !== undefined) {
        return new Incident("InvalidMapKey", {key, value}, "Invalid map entry: invalid key");
      }
      const valueError: Error | undefined = this.valueType.testError(value);
      if (valueError !== undefined) {
        return new Incident("InvalidMapValue", {key, value}, "Invalid map entry: invalid value");
      }
    }
    return undefined;
  }

  test(val: Map<K, V>): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: Map<K, V>, val2: Map<K, V>): boolean {
    if (val2.size !== val1.size) {
      return false;
    }
    const unmatched: Map<K, V> = new Map(val1);
    for (const [key2, value2] of val2) {
      for (const [key1, value1] of unmatched) {
        if (this.keyType.equals(key1, key2)) {
          if (!this.valueType.equals(value1, value2)) {
            return false;
          }
          unmatched.delete(key1);
          break;
        }
      }
    }
    return true;
  }

  clone(val: Map<K, V>): Map<K, V> {
    const result: Map<K, V> = new Map();
    for (const [key, value] of val) {
      const keyClone: K = this.keyType.clone(key);
      const valueClone: V = this.valueType.clone(value);
      result.set(key, value);
    }
    return result;
  }

  diff(oldVal: Map<K, V>, newVal: Map<K, V>): Diff | undefined {
    throw createNotImplementedError("MapType#diff");
  }

  patch(oldVal: Map<K, V>, diff: Diff | undefined): Map<K, V> {
    throw createNotImplementedError("MapType#patch");
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("MapType#reverseDiff");
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    throw createNotImplementedError("MapType#squash");
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw createLazyOptionsError(this);
    }
    const options: MapTypeOptions<K, V> = typeof this._options === "function" ? this._options() : this._options;

    const keyType: VersionedType<K, any> = options.keyType;
    const valueType: VersionedType<V, any> = options.valueType;
    const maxSize: number = options.maxSize;
    const assumeStringKey: boolean = options.assumeStringKey || false;

    Object.assign(this, {keyType, valueType, maxSize, assumeStringKey});
  }
}
