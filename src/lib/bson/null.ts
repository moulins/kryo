import { WrongTypeError } from "../_errors/wrong-type";
import { name as typeName, NullType } from "../null";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";

function write(type: NullType, value: null): null {
  return null;
}

function read(type: NullType, input: null): null {
  if (input !== null) {
    throw WrongTypeError.create("null", input);
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
