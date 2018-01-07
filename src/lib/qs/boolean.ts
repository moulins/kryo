import { BooleanType, name as typeName } from "../boolean";
import { WrongTypeError } from "../errors/wrong-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";

function write(type: BooleanType, value: boolean): "true" | "false" {
  return value ? "true" : "false";
}

function read(type: BooleanType, input: "true" | "false"): boolean {
  if (!(input === "true" || input === "false")) {
    throw WrongTypeError.create("\"true\" | \"false\"", input);
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
