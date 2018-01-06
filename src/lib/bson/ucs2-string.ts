import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { name as typeName, Ucs2StringType } from "../ucs2-string";

function write(type: Ucs2StringType, value: string): string {
  return value;
}

function read(type: Ucs2StringType, input: string): string {
  const error: Error | undefined = type.testError(input);
  if (error !== undefined) {
    throw error;
  }
  return input;
}

function readTrusted(type: Ucs2StringType, input: string): string {
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
