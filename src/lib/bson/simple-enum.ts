import { Incident } from "incident";
import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { name as typeName, SimpleEnumType } from "../types/simple-enum";

function write<E extends number>(type: SimpleEnumType<E>, value: E): string {
  return type.valueToOutputName[value as number];
}

function read<E extends number>(type: SimpleEnumType<E>, input: string): E {
  if (typeof input !== "string") {
    throw createInvalidTypeError("string", input);
  }
  if (!type.outputNameToValue.hasOwnProperty(input)) {
    throw Incident("Unknown enum variant name", input);
  }
  return type.outputNameToValue[input] as E;
}

function readTrusted<E extends number>(type: SimpleEnumType<E>, input: string): E {
  return type.outputNameToValue[input] as E;
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
