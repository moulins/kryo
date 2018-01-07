/**
 * This module defines most of the Typescript interfaces and type aliases used by Kryo.
 */

/**
 * Represents a lazy value of type `T`.
 * You can retrieve it with `const val = typeof lazy === "function" ? lazy() : lazy;`.
 * This library guarantees that it will be only called once but you should still ensure that it is idempotent.
 */
export type Lazy<T> = T | (() => T);

export type TypeName<T = any> = string;

export interface Type<T> {
  name: TypeName<any>;

  testError(val: T): Error | undefined;

  test(val: T): boolean;

  equals(val1: T, val2: T): boolean;

  clone(val: T): T;

  toJSON(): any;
}

export interface JsonSerializer<T, Input = any, Output extends Input = Input> {
  name: TypeName<any>;

  writeJson(val: T): Output;

  readJson(serialized: Input): T;

  readTrustedJson(serialized: Output): T;
}

export interface Serializer {
  readonly format: string;

  register(serializer: TypeSerializer<any>): void;

  write<T>(type: Type<T>, value: T): any;

  read<T>(type: Type<T>, input: any): T;

  readTrusted<T>(type: Type<T>, input: any): T;
}

export interface TypeSerializer<T, Input = any, Output extends Input = Input> {
  typeName: TypeName<any>;

  write(type: Type<any>, val: T): Output;

  read(type: Type<any>, serialized: Input): T;

  readTrusted(type: Type<any>, serialized: Output): T;
}

export interface VersionedType<T, Input, Output extends Input, Diff>
  extends Type<T>, JsonSerializer<T, Input, Output> {
  /**
   * Returns undefined if both values are equivalent, otherwise a diff representing the change from
   * oldVal to newVal.
   *
   * @param oldVal The old value
   * @param newVal The new value
   */
  diff(oldVal: T, newVal: T): Diff | undefined;

  patch(oldVal: T, diff: Diff | undefined): T;

  reverseDiff(diff: Diff | undefined): Diff | undefined;

  squash(oldDiff: Diff | undefined, newDiff: Diff | undefined): Diff | undefined;

  // readonly diffType: Type<Diff>;
}

export interface CollectionType<T, I> extends Type<T> {
  iterateSync(value: T, visitor: (item: I) => any): void;
}

// tslint:disable-next-line:max-line-length
// export interface VersionedCollectionType<T, S, D, I> extends CollectionType <T, D, I>, VersionedType<T, S, D> {
//   isCollection: true;
//   isVersioned: true;
//   isSerializable: true;
// }
