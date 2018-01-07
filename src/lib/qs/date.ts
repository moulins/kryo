import { WrongTypeError } from "../errors/wrong-type";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { DateType, name as typeName } from "../types/date";

function write(type: DateType, value: Date): string {
  return value.toISOString();
}

function read(type: DateType, input: string): Date {
  let result: Date;
  if (typeof input !== "string") {
    throw WrongTypeError.create("string", input);
  }
  result = new Date(input);
  const error: Error | undefined = type.testError(result);
  if (error !== undefined) {
    throw error;
  }
  return result;
}

function readTrusted(type: DateType, input: string): Date {
  return new Date(input);
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
