import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";
import { CodepointStringType, name as typeName } from "../types/codepoint-string";

function write(type: CodepointStringType, value: string): string {
  return value;
}

function read(type: CodepointStringType, input: string): string {
  const error: Error | undefined = type.testError(input);
  if (error !== undefined) {
    throw error;
  }
  return input;
}

function readTrusted(type: CodepointStringType, input: string): string {
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
