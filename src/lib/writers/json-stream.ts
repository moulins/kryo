import { Writer } from "../types";

export interface WritableStream {
  /**
   * Write a string to the stream.
   *
   * @param chunk Chunk of UCS2 code units, they must be encoded as UTF-8.
   * @return Boolean indicating that the stream can accept more data.
   */
  write(chunk: string): boolean;
}

export class JsonStreamWriter implements Writer<boolean> {
  private readonly stream: WritableStream;

  constructor(stream: WritableStream) {
    this.stream = stream;
  }

  writeFloat64(value: number): boolean {
    if (isNaN(value)) {
      return this.writeUcs2String("NaN");
    } else if (value === Infinity) {
      return this.writeUcs2String("+Infinity");
    } else if (value === -Infinity) {
      return this.writeUcs2String("-Infinity");
    } else if (Object.is(value, -0)) {
      return this.writeUcs2String("-0");
    }
    return this.stream.write(value.toString(10));
  }

  writeBoolean(value: boolean): boolean {
    return this.stream.write(value ? "true" : "false");
  }

  writeDate(value: Date): boolean {
    return this.writeUcs2String(value.toISOString());
  }

  writeUcs2String(value: string): boolean {
    return this.stream.write(JSON.stringify(value));
  }

  writeBuffer(value: Uint8Array): boolean {
    const result: string[] = new Array(value.length);
    const len: number = value.length;
    for (let i: number = 0; i < len; i++) {
      result[i] = (value[i] < 16 ? "0" : "") + value[i].toString(16);
    }
    return this.writeUcs2String(result.join(""));
  }

  writeNull(): boolean {
    return this.stream.write("null");
  }

  writeJson(value: any): boolean {
    return this.stream.write(JSON.stringify(value));
  }

  writeArray(size: number, handler: (index: number, itemWriter: Writer<boolean>) => boolean): boolean {
    let shouldContinue: boolean = true;
    shouldContinue = this.stream.write("[") && shouldContinue;
    for (let index: number = 0; index < size; index++) {
      if (index > 0) {
        shouldContinue = this.stream.write(",") && shouldContinue;
      }
      shouldContinue = handler(index, this) && shouldContinue;
    }
    return this.stream.write("]") && shouldContinue;
  }

  writeDocument<K extends string>(
    keys: Iterable<K>,
    handler: (key: K, fieldWriter: Writer<boolean>) => boolean,
  ): boolean {
    let shouldContinue: boolean = true;
    shouldContinue = this.stream.write("{") && shouldContinue;
    let first: boolean = true;
    for (const key of keys) {
      if (!first) {
        shouldContinue = this.stream.write(",") && shouldContinue;
      }
      shouldContinue = this.writeUcs2String(key) && shouldContinue;
      shouldContinue = this.stream.write(":") && shouldContinue;
      shouldContinue = handler(key, this) && shouldContinue;
      first = false;
    }
    return this.stream.write("}") && shouldContinue;
  }

  writeMap(
    size: number,
    keyHandler: (index: number, mapKeyWriter: Writer<boolean>) => boolean,
    valueHandler: (index: number, mapValueWriter: Writer<boolean>) => boolean,
  ): boolean {
    let shouldContinue: boolean = true;
    shouldContinue = this.stream.write("{") && shouldContinue;
    for (let index: number = 0; index < size; index++) {
      if (index > 0) {
        shouldContinue = this.stream.write(",") && shouldContinue;
      }
      const chunks: string[] = [];
      const subStream: JsonStreamWriter = new JsonStreamWriter({
        write(chunk: string): boolean {
          chunks.push(chunk);
          return shouldContinue;
        },
      });
      shouldContinue = keyHandler(index, subStream) && shouldContinue;
      shouldContinue = this.writeUcs2String(chunks.join("")) && shouldContinue;
      shouldContinue = this.stream.write(":") && shouldContinue;
      shouldContinue = valueHandler(index, this) && shouldContinue;
    }
    return this.stream.write("}") && shouldContinue;
  }
}
