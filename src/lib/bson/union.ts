import { Incident } from "incident";
import { Serializer, Type } from "../types";
import { name as typeName, UnionType } from "../types/union";

export function register(serializer: Serializer): void {
  function write<T>(type: UnionType<T>, val: T): any {
    return serializer.write(type.trustedMatcher(val), val);
  }

  function readWithVariant<T>(type: UnionType<T>, input: any): [T, Type<T>] {
    const variant: Type<T> | undefined = type.readMatcher(input, serializer);
    if (variant === undefined) {
      throw new Incident("UnknownUnionVariant", "Unknown union variant");
    }
    return [serializer.read(variant, input), variant];
  }

  function read<T>(type: UnionType<T>, input: any): T {
    return readWithVariant(type, input)[0];
  }

  function readTrustedWithVariant<T>(type: UnionType<T>, input: any): [T, Type<T>] {
    const variant: Type<T> = type.readTrustedMatcher(input, serializer);
    return [serializer.readTrusted(variant, input), variant];
  }

  function readTrusted<T>(type: UnionType<T>, input: any): T {
    return readTrustedWithVariant(type, input)[0];
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
