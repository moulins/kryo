import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer, TypeSerializer } from "../types";
import { BooleanType, name as typeName } from "../types/boolean";

function write(type: BooleanType, value: boolean): "true" | "false" {
  return value ? "true" : "false";
}

function read(type: BooleanType, input: "true" | "false"): boolean {
  if (!(input === "true" || input === "false")) {
    throw createInvalidTypeError("\"true\" | \"false\"", input);
  }
  return input === "true";
}

function readTrusted(type: BooleanType, input: "true" | "false"): boolean {
  return input === "true";
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
