/**
 * @module kryo/readers/bson
 */

import BSON from "bson";

import { Reader, ReadVisitor } from "../core.js";
import { BsonValueReader } from "./bson-value.js";

export class BsonReader implements Reader<Buffer> {
  trustInput?: boolean | undefined;

  private readonly bson: typeof BSON;

  private readonly valueReader: BsonValueReader;

  private readonly primitiveWrapper: string;

  constructor(bson: typeof BSON, trust?: boolean, primitiveWrapper: string = "_") {
    this.bson = bson;
    this.trustInput = trust;
    this.primitiveWrapper = primitiveWrapper;
    this.valueReader = new BsonValueReader(trust);
  }

  readAny<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readAny(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBoolean(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBytes(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readDate<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDate(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readDocument<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDocument(this.bson.deserialize(raw), visitor);
  }

  readFloat64<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readFloat64(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readList(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readMap(this.bson.deserialize(raw), visitor);
  }

  readNull<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readNull(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readString<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readString(this.bson.deserialize(raw)[this.primitiveWrapper], visitor);
  }
}
