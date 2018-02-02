import { Incident } from "incident";
import { Type, Writer } from "../types";

/**
 * Base class for `json`, `qs` and `bson` writers.
 */
export abstract class StructuredWriter implements Writer<any> {
  abstract writeBoolean(value: boolean): any;

  abstract writeDate(value: Date): any;

  abstract writeFloat64(value: number): any;

  abstract writeUcs2String(value: string): any;

  abstract writeBuffer(value: Uint8Array): any;

  abstract writeNull(): any;

  writeAny(value: any): any {
    return JSON.parse(JSON.stringify(value));
  }

  writeArray(size: number, handler: (index: number, itemWriter: Writer<any>) => any): any[] {
    const result: any[] = [];
    for (let index: number = 0; index < size; index++) {
      result.push(handler(index, this));
    }
    return result;
  }

  writeDocument<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<any>) => any,
  ): {[P in K]: any} {
    const result: any = {};
    for (const key of keys) {
      result[key] = handler(key, this);
    }
    return result;
  }

  abstract writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any;
}
