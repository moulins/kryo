import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer } from "../serializer";
import { ArrayType, name as typeName } from "../types/array";

export function register(serializer: Serializer): void {
  function write<T>(type: ArrayType<T>, val: T[]): any[] {
    return val.map((item: T): any => serializer.write(type.itemType, item));
  }

  function read<T>(type: ArrayType<T>, input: any[]): T[] {
    let result: T[];
    if (!Array.isArray(input)) {
      throw createInvalidTypeError("array", input);
    }
    result = input.map((item: any): T => serializer.read(type.itemType, item));
    const error: Error | undefined = type.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  function readTrusted<T>(type: ArrayType<T>, input: any[]): T[] {
    return input.map((item: any): T => serializer.readTrusted(type.itemType, item));
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
