import { Incident } from "incident";
import { Serializer, TypeSerializer } from "../types";
import { JsonType, name as typeName } from "../types/json";

function write(type: JsonType, value: any): any {
  return JSON.parse(JSON.stringify(value));
}

function read(type: JsonType, input: any): any {
  try {
    return JSON.parse(JSON.stringify(input));
  } catch (err) {
    throw new Incident(err, "InvalidJson");
  }
}

function readTrusted(type: JsonType, input: any): any {
  return JSON.parse(JSON.stringify(input));
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
