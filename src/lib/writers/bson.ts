import bson from "bson";
import { Writer } from "../types";
import { JsonWriter } from "./json";
import { StructuredWriter } from "./structured";

export class BsonWriter extends StructuredWriter {
  private readonly bsonLib: typeof bson;

  constructor(bsonLib: typeof bson) {
    super();
    this.bsonLib = bsonLib;
  }

  writeFloat64(value: number): number {
    return value;
  }

  writeBoolean(value: boolean): boolean {
    return value;
  }

  writeNull(): null {
    return null;
  }

  writeBuffer(value: Uint8Array): bson.Binary {
    // TODO: Update Node type definitions
    return new this.bsonLib.Binary(Buffer.from(value as any));
  }

  writeDate(value: Date): Date {
    return new Date(value.getTime());
  }

  writeString(value: string): string {
    return value;
  }

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): any {
    const result: any = {};
    for (let index: number = 0; index < size; index++) {
      // TODO: Use a specialized writer that only accepts strings and numbers (KeyMustBeAStringError)
      // Let users build custom serializers if they want
      const jsonWriter: JsonWriter = new JsonWriter();
      const key: any = keyHandler(index, jsonWriter);
      result[JSON.stringify(key)] = valueHandler(index, this);
    }
    return result;
  }
}
