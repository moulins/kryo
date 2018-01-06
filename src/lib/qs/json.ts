import { NotImplementedError } from "../_errors/not-implemented";
import { JsonType, name as typeName } from "../json";
import { Serializer } from "../serializer";
import { TypeSerializer } from "../types";

function write(type: JsonType, value: any): any {
  throw NotImplementedError.create("qs/json/write");
}

function read(type: JsonType, input: any): any {
  throw NotImplementedError.create("qs/json/read");
}

function readTrusted(type: JsonType, input: any): any {
  throw NotImplementedError.create("qs/json/readTrusted");
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
