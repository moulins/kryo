import { Incident } from "incident";
import { Serializer, Type, TypeName, TypeSerializer } from "./types";

export class BaseSerializer implements Serializer {
  readonly format: string;
  private readonly types: Map<TypeName, TypeSerializer<any>>;

  constructor(format: string) {
    this.format = format;
    this.types = new Map();
  }

  register(serializer: TypeSerializer<any>): void {
    this.types.set(serializer.typeName, serializer);
  }

  write<T>(type: Type<T>, value: T): any {
    return this.getTypeSerializer(type.name).write(type, value);
  }

  read<T>(type: Type<T>, input: any): T {
    return this.getTypeSerializer(type.name).read(type, input);
  }

  readTrusted<T>(type: Type<T>, input: any): T {
    return this.getTypeSerializer(type.name).readTrusted(type, input);
  }

  private getTypeSerializer(name: TypeName): TypeSerializer<any> {
    const result: TypeSerializer<any> | undefined = this.types.get(name);
    if (result === undefined) {
      throw new Incident("UnknownType", {name, types: new Map([...this.types.entries()])});
    }
    return result;
  }
}
