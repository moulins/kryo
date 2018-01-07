import { WrongTypeError } from "../errors/wrong-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { Float64Type, name as typeName } from "../types/float64";

// TODO(demurgos): Check if BSON support NaN and Infinity (add some tests)

function write(type: Float64Type, value: number): number {
  return value;
}

function read(type: Float64Type, input: number): number {
  if (typeof input !== "number") {
    throw WrongTypeError.create("number", input);
  }
  // TODO: NaN and Infinity checks
  return input;
}

function readTrusted(type: Float64Type, input: number): number {
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
