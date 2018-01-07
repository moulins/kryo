import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer } from "../types";
import { TypeSerializer } from "../types";
import { name as typeName, NullType } from "../types/null";

function write(type: NullType, value: null): "" {
  return "";
}

function read(type: NullType, input: ""): null {
  if (input !== "") {
    throw createInvalidTypeError("\"\"", input);
  }
  return null;
}

function readTrusted(type: NullType, input: ""): null {
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
