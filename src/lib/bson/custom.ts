import { Serializer } from "../types";
import { CustomType, name as typeName } from "../types/custom";

export function register(serializer: Serializer): void {
  function write<T>(type: CustomType<T>, value: T): any {
    return type.write(value, serializer);
  }

  function read<T>(type: CustomType<T>, input: any): T {
    return type.read(input, serializer);
  }

  function readTrusted<T>(type: CustomType<T>, input: any): T {
    return type.read(input, serializer);
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
