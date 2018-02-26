import _bson from "bson";
import { Reader, ReadVisitor } from "../types";
import { BsonValueReader } from "./bson-value";

export class BsonReader implements Reader<Buffer> {
  trustInput?: boolean | undefined;

  private readonly bsonSerializer: _bson.BSON;

  private readonly valueReader: BsonValueReader;

  private readonly primitiveWrapper: string;

  constructor(bson: typeof _bson, trust?: boolean, primitiveWrapper: string = "_") {
    this.bsonSerializer = new _bson.BSON();
    this.trustInput = trust;
    this.primitiveWrapper = primitiveWrapper;
    this.valueReader = new BsonValueReader(trust);
  }

  readAny<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readAny(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBoolean(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBytes(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readDate<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDate(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readDocument<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDocument(this.bsonSerializer.deserialize(raw), visitor);
  }

  readFloat64<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readFloat64(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readList(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readMap(this.bsonSerializer.deserialize(raw), visitor);
  }

  readNull<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readNull(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }

  readString<R>(raw: Buffer, visitor: ReadVisitor<R>): R {
    return this.valueReader.readString(this.bsonSerializer.deserialize(raw)[this.primitiveWrapper], visitor);
  }
}
