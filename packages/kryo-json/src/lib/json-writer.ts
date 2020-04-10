/**
 * @module kryo/writers/json
 */

import { Writer } from "kryo/lib/core.js";

import { JsonValueWriter } from "./json-value-writer.js";

export class JsonWriter implements Writer<string> {
  private readonly valueWriter: JsonValueWriter;

  constructor() {
    this.valueWriter = new JsonValueWriter();
  }

  writeAny(value: number): string {
    return JSON.stringify(this.valueWriter.writeAny(value));
  }

  writeBoolean(value: boolean): string {
    return JSON.stringify(this.valueWriter.writeBoolean(value));
  }

  writeBytes(value: Uint8Array): string {
    return JSON.stringify(this.valueWriter.writeBytes(value));
  }

  writeDate(value: Date): string {
    return JSON.stringify(this.valueWriter.writeDate(value));
  }

  writeDocument<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<any>) => any,
  ): string {
    return JSON.stringify(this.valueWriter.writeDocument(keys, handler));
  }

  writeFloat64(value: number): string {
    return JSON.stringify(this.valueWriter.writeFloat64(value));
  }

  writeList(size: number, handler: (index: number, itemWriter: Writer<any>) => any): string {
    return JSON.stringify(this.valueWriter.writeList(size, handler));
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any {
    return JSON.stringify(this.valueWriter.writeMap(size, keyHandler, valueHandler));
  }

  writeNull(): string {
    return JSON.stringify(this.valueWriter.writeNull());
  }

  writeString(value: string): string {
    return JSON.stringify(this.valueWriter.writeString(value));
  }
}
