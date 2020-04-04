/**
 * @module kryo/writers/bson
 */

import BSON from "bson";

import { Writer } from "../core.js";
import { BsonValueWriter } from "./bson-value.js";

export class BsonWriter implements Writer<Buffer> {

  private readonly bson: typeof BSON;
  private readonly valueWriter: BsonValueWriter;
  private readonly primitiveWrapper: string;

  constructor(bson: typeof BSON, primitiveWrapper: string = "_") {
    this.bson = bson;
    this.primitiveWrapper = primitiveWrapper;
    this.valueWriter = new BsonValueWriter(bson);
  }

  writeAny(value: number): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeAny(value)});
  }

  writeBoolean(value: boolean): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeBoolean(value)});
  }

  writeBytes(value: Uint8Array): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeBytes(value)});
  }

  writeDate(value: Date): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeDate(value)});
  }

  writeDocument<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<any>) => any,
  ): Buffer {
    return this.bson.serialize(this.valueWriter.writeDocument(keys, handler));
  }

  writeFloat64(value: number): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeFloat64(value)});
  }

  writeList(size: number, handler: (index: number, itemWriter: Writer<any>) => any): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeList(size, handler)});
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any {
    return this.bson.serialize(this.valueWriter.writeMap(size, keyHandler, valueHandler));
  }

  writeNull(): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeNull()});
  }

  writeString(value: string): Buffer {
    return this.bson.serialize({[this.primitiveWrapper]: this.valueWriter.writeString(value)});
  }
}
