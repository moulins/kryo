import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer, TypeSerializer } from "../types";
import { IntegerType, name as typeName } from "../types/integer";

function write(type: IntegerType, value: number): number {
  return value;
}

function read(type: IntegerType, input: number): number {
  let val: number;
  if (typeof input !== "number") {
    throw createInvalidTypeError("number", input);
  }
  val = input;
  const err: Error | undefined = type.testError(val);
  if (err !== undefined) {
    throw err;
  }

  return val;
}

function readTrusted(type: IntegerType, input: number): number {
  return input;
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
