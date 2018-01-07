import { BufferType, name as typeName } from "../buffer";
import { WrongTypeError } from "../errors/wrong-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";

function write(type: BufferType, val: Uint8Array): string {
  const result: string[] = new Array(val.length);
  const len: number = val.length;
  for (let i: number = 0; i < len; i++) {
    result[i] = (val[i] < 16 ? "0" : "") + val[i].toString(16);
  }
  return result.join("");
}

function read(type: BufferType, input: string): Uint8Array {
  let result: Uint8Array;
  if (typeof input !== "string") {
    throw WrongTypeError.create("string", input);
  } else if (!/^(?:[0-9a-f]{2})*$/.test(input)) {
    throw WrongTypeError.create("lowerCaseHexEvenLengthString", input);
  }
  const len: number = input.length / 2;
  result = new Uint8Array(len);
  for (let i: number = 0; i < len; i++) {
    result[i] = parseInt(input.substr(2 * i, 2), 16);
  }
  const error: Error | undefined = type.testError(result);
  if (error !== undefined) {
    throw error;
  }
  return result;
}

export function readTrusted(type: BufferType, input: string): Uint8Array {
  const len: number = input.length / 2;
  const result: Uint8Array = new Uint8Array(len);
  for (let i: number = 0; i < len; i++) {
    result[i] = parseInt(input.substr(2 * i, 2), 16);
  }
  return result;
}

export const SERIALIZER: TypeSerializer<any> = {
  typeName,
  write,
  read,
  readTrusted,
};

export function register(serializer: Serializer): void {
  serializer.register(SERIALIZER);
}
