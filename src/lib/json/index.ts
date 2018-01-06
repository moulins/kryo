import { Incident } from "incident";
import { JsonSerializer, Serializer, Type, TypeSerializer } from "../types";

export const JSON_SERIALIZER: Serializer = {
  format: "json",

  register(serializer: TypeSerializer<any>): never {
    throw new Incident("NotImplemented", "JSON_SERIALIZER.register");
  },

  write<T>(type: Type<T>, value: T): any {
    return (<any> type as JsonSerializer<T>).writeJson(value);
  },

  read<T>(type: Type<T>, input: any): T {
    return (<any> type as JsonSerializer<T>).readJson(input);
  },

  readTrusted<T>(type: Type<T>, input: any): T {
    return (<any> type as JsonSerializer<T>).readTrustedJson(input);
  },
};
