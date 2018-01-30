import { Writer } from "../types";
import { JsonWriter } from "./json";
import { StructuredWriter } from "./structured";

export class QsWriter extends StructuredWriter {
  writeFloat64(value: number): string {
    if (isNaN(value)) {
      return "NaN";
    } else if (value === Infinity) {
      return "+Infinity";
    } else if (value === -Infinity) {
      return "-Infinity";
    }
    return value.toString(10);
  }

  writeDate(value: Date): string {
    return value.toISOString();
  }

  writeNull(): "" {
    return "";
  }

  writeBuffer(value: Uint8Array): string {
    const result: string[] = new Array(value.length);
    const len: number = value.length;
    for (let i: number = 0; i < len; i++) {
      result[i] = (value[i] < 16 ? "0" : "") + value[i].toString(16);
    }
    return result.join("");
  }

  writeBoolean(value: boolean): "true" | "false" {
    return value ? "true" : "false";
  }

  writeUcs2String(value: string): string {
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
