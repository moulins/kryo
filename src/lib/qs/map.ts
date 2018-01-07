import { createInvalidTypeError } from "../errors/invalid-type";
import { Serializer } from "../serializer";
import { MapType, name as typeName } from "../types/map";

export function register(serializer: Serializer): void {
  function write<K, V>(type: MapType<K, V>, val: Map<K, V>): {[key: string]: any} {
    const result: {[key: string]: any} = {};
    for (const [key, value] of val) {
      const rawKey: any = type.keyType.writeJson(key);
      const keyString: string = JSON.stringify(rawKey);
      // TODO(demurgos): Check for duplicate keys
      result[keyString] = serializer.write(type.valueType, value);
    }
    return result;
  }

  function read<K, V>(type: MapType<K, V>, input: {[key: string]: any}): Map<K, V> {
    if (typeof input !== "object" || input === null) {
      throw createInvalidTypeError("object", input);
    }
    const result: Map<K, V> = new Map();
    for (const keyString in input) {
      let rawKey: any;
      try {
        rawKey = JSON.parse(keyString);
      } catch (err) {
        throw err;
      }
      const key: K = type.keyType.readJson(rawKey);
      const value: V = serializer.read(type.valueType, input[keyString]);
      result.set(key, value);
    }
    const error: Error | undefined = type.testError(result);
    if (error !== undefined) {
      throw error;
    }
    return result;
  }

  function readTrusted<K, V>(type: MapType<K, V>, input: {[key: string]: any}): Map<K, V> {
    const result: Map<K, V> = new Map();
    for (const keyString in input) {
      const key: K = type.keyType.readTrustedJson(JSON.parse(keyString));
      const value: V = serializer.readTrusted(type.valueType, input[keyString]);
      result.set(key, value);
    }
    return result;
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
