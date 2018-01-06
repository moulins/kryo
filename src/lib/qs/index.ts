import { Incident } from "incident";
import { QsSerializer, Serializer, Type, TypeSerializer } from "../types";

export const QS_SERIALIZER: Serializer = {
  format: "qs",

  register(serializer: TypeSerializer<any>): never {
    throw new Incident("NotImplemented", "QS_SERIALIZER.register");
  },

  write<T>(type: Type<T>, value: T): any {
    return (<any> type as QsSerializer<T>).writeQs(value);
  },

  read<T>(type: Type<T>, input: any): T {
    return (<any> type as QsSerializer<T>).readQs(input);
  },

  readTrusted<T>(type: Type<T>, input: any): T {
    return (<any> type as QsSerializer<T>).readTrustedQs(input);
  },
};
