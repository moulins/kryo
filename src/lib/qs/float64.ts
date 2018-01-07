import { Incident } from "incident";
import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { Float64Type, name as typeName } from "../types/float64";

function write(type: Float64Type, value: number): string {
  if (isNaN(value)) {
    return "NaN";
  } else if (value === Infinity) {
    return "+Infinity";
  } else if (value === -Infinity) {
    return "-Infinity";
  }
  return value.toString(10);
}

function read(type: Float64Type, input: string): number {
  if (typeof input !== "string") {
    throw createInvalidTypeError("string", input);
  }
  switch (input) {
    case "NaN":
      if (type.notNan) {
        throw Incident("Nan", "NaN is not allowed");
      }
      return NaN;
    case "+Infinity":
      if (type.notNan) {
        throw Incident("Infinity", "+Infinity is not allowed");
      }
      return Infinity;
    case "-Infinity":
      if (type.notNan) {
        throw Incident("Infinity", "-Infinity is not allowed");
      }
      return -Infinity;
    default:
      const val: number = parseFloat(input);
      const error: Error | undefined = type.testError(val);
      if (error !== undefined) {
        throw error;
      }
      return val;
  }
}

function readTrusted(type: Float64Type, input: string): number {
  switch (input) {
    case "NaN":
      return NaN;
    case "+Infinity":
      return Infinity;
    case "-Infinity":
      return -Infinity;
    default:
      return parseFloat(input);
  }
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
