import { WrongTypeError } from "../errors/wrong-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { IntegerType, name as typeName } from "../types/integer";

function write(type: IntegerType, value: number): number {
  return value;
}

function read(type: IntegerType, input: number): number {
  let val: number;
  if (typeof input !== "number") {
    throw WrongTypeError.create("number", input);
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
