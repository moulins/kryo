import { WrongTypeError } from "../errors/wrong-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { name as typeName, NullType } from "../types/null";

function write(type: NullType, value: null): "" {
  return "";
}

function read(type: NullType, input: ""): null {
  if (input !== "") {
    throw WrongTypeError.create("\"\"", input);
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
