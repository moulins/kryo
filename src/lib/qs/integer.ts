import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { IntegerType, name as typeName } from "../types/integer";

function write(type: IntegerType, value: number): string {
  return value.toString(10);
}

function read(type: IntegerType, input: string): number {
  let val: number;
  if (typeof input !== "string") {
    throw createInvalidTypeError("string", input);
  }
  val = parseInt(input, 10);
  const err: Error | undefined = type.testError(val);
  if (err !== undefined) {
    throw err;
  }

  return val;
}

function readTrusted(type: IntegerType, input: string): number {
  return parseInt(input, 10);
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
