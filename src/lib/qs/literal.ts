import { Serializer } from "../types";
import { LiteralType, name as typeName } from "../types/literal";

export function register(serializer: Serializer): void {
  function write<T>(type: LiteralType<T>, value: T): any {
    return serializer.write(type.type, value);
  }

  function read<T>(type: LiteralType<T>, input: any): T {
    return serializer.read(type.type, input);
  }

  function readTrusted<T>(type: LiteralType<T>, input: any): T {
    return serializer.readTrusted(type.type, input);
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
