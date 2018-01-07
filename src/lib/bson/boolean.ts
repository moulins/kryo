import { WrongTypeError } from "../errors/wrong-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { BooleanType, name as typeName } from "../types/boolean";

function write(type: BooleanType, value: boolean): boolean {
  return value;
}

function read(type: BooleanType, input: boolean): boolean {
  if (typeof input !== "boolean") {
    throw WrongTypeError.create("boolean", input);
  }
  return input;
}

function readTrusted(type: BooleanType, input: boolean): boolean {
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
