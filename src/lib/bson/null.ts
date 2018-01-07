import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { name as typeName, NullType } from "../types/null";

function write(type: NullType, value: null): null {
  return null;
}

function read(type: NullType, input: null): null {
  if (input !== null) {
    throw createInvalidTypeError("null", input);
  }
  return null;
}

function readTrusted(type: NullType, input: null): null {
  return null;
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
