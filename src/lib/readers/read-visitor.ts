import { ReadVisitor } from "../types";

function fromBoolean(input: boolean): never {
  throw new Error("Unable to read from boolean");
}

function fromBuffer(input: Uint8Array): never {
  throw new Error("Unable to read from buffer");
}

function fromDate(input: Date): never {
  throw new Error("Unable to read from date");
}

function fromFloat64(input: number): never {
  throw new Error("Unable to read from float64");
}

function fromList(input: Iterable<any>): never {
  throw new Error("Unable to read from list");
}

function fromMap(input: Map<any, any>): never {
  throw new Error("Unable to read from map");
}

function fromNull(): never {
  throw new Error("Unable to read from null");
}

function fromString(input: string): never {
  throw new Error("Unable to read from string");
}

export function readVisitor<R>(partial: Partial<ReadVisitor<R>>): ReadVisitor<R> {
  return {
    fromBuffer,
    fromBoolean,
    fromDate,
    fromFloat64,
    fromMap,
    fromNull,
    fromList,
    fromString,
    ...partial,
  };
}
