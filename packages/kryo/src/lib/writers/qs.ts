/**
 * @module kryo/writers/qs
 */

import _qs from "qs";

import { Writer } from "../core.js";
import { QsValueWriter } from "./qs-value.js";

export class QsWriter implements Writer<string> {
  private readonly valueWriter: QsValueWriter;
  private readonly qs: typeof _qs;
  private readonly primitiveWrapper: string;

  constructor(qs: typeof _qs, primitiveWrapper: string = "_") {
    this.qs = qs;
    this.primitiveWrapper = primitiveWrapper;
    this.valueWriter = new QsValueWriter();
  }

  writeAny(value: number): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeAny(value)});
  }

  writeBoolean(value: boolean): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeBoolean(value)});
  }

  writeBytes(value: Uint8Array): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeBytes(value)});
  }

  writeDate(value: Date): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeDate(value)});
  }

  writeDocument<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<any>) => any,
  ): string {
    return this.qs.stringify(this.valueWriter.writeDocument(keys, handler));
  }

  writeFloat64(value: number): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeFloat64(value)});
  }

  writeList(size: number, handler: (index: number, itemWriter: Writer<any>) => any): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeList(size, handler)});
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any {
    return this.qs.stringify(this.valueWriter.writeMap(size, keyHandler, valueHandler));
  }

  writeNull(): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeNull()});
  }

  writeString(value: string): string {
    return this.qs.stringify({[this.primitiveWrapper]: this.valueWriter.writeString(value)});
  }
}
