import { Binary as BinaryType } from "bson";
import { createMissingDependencyError } from "../errors/missing-dependency";
import { Serializer, TypeSerializer } from "../types";
import { BufferType, name as typeName } from "../types/buffer";

// TODO: Fix BSON type definitions
interface BinaryConstructor {
  new(buffer: Uint8Array): BinaryType;
}

// tslint:disable-next-line:variable-name
let Binary: BinaryConstructor | undefined = undefined;

function getBinary(): BinaryConstructor {
  if (Binary === undefined) {
    try {
      // tslint:disable-next-line:no-var-requires no-require-imports
      Binary = require("bson").Binary;
    } catch (err) {
      throw createMissingDependencyError("bson", "Required to write buffers to BSON.");
    }
  }
  return Binary!;
}

function isBinary(val: any): val is BinaryType {
  return val._bsontype === "Binary";
}

function write(type: BufferType, val: Uint8Array): BinaryType {
  return new (getBinary())(Buffer.from(val as any));
}

function read(type: BufferType, input: BinaryType | Buffer | Uint8Array): Uint8Array {
  let result: Uint8Array;
  if (isBinary(input)) {
    // TODO: Fix BSON type definitions
    result = (<any> input as {value(asRaw: true): Buffer}).value(true);
  } else {
    result = input;
  }
  const error: Error | undefined = type.testError(result);
  if (error !== undefined) {
    throw error;
  }
  return result;
}

export function readTrusted(type: BufferType, input: BinaryType): Uint8Array {
  return (<any> input as {value(asRaw: true): Buffer}).value(true);
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
