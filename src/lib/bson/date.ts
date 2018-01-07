import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer, TypeSerializer } from "../types";
import { DateType, name as typeName } from "../types/date";

function write(type: DateType, value: Date): Date {
  return new Date(value.getTime());
}

function read(type: DateType, input: Date): Date {
  let result: Date;
  if (!(input instanceof Date)) {
    throw createInvalidTypeError("Date", input);
  }
  result = new Date(input.getTime());
  const error: Error | undefined = type.testError(result);
  if (error !== undefined) {
    throw error;
  }
  return result;
}

function readTrusted(type: DateType, input: Date): Date {
  return new Date(input.getTime());
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
