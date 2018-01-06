import { LiteralType, name as typeName } from "../literal";
import { Serializer } from "../serializer";

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
