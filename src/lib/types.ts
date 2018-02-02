/**
 * This module defines most of the Typescript interfaces and type aliases used by Kryo.
 */

/**
 * Represents a lazy value of type `T`.
 * You can retrieve it with `const val = typeof lazy === "function" ? lazy() : lazy;`.
 * This library guarantees that it will be only called once but you should still ensure that it is idempotent.
 */
export type Lazy<T> = T | (() => T);

export interface Type<T> {
  // name: string;

  testError(val: T): Error | undefined;

  test(val: T): boolean;

  equals(val1: T, val2: T): boolean;

  clone(val: T): T;

  toJSON(): any;

  write?<W>(writer: Writer<W>, value: T): W;

  read?<R>(reader: Reader<R>, raw: R): T;
}

export interface Writable<T> {
  write<W>(writer: Writer<W>, value: T): W;
}

export interface Readable<T> {
  read<R>(reader: Reader<R>, raw: R): T;
}

/**
 * Represents a type suitable for IO operations: this type supports serialization and deserialization.
 */
export interface IoType<T> extends Type<T>, Readable<T>, Writable<T> {
  write<W>(writer: Writer<W>, value: T): W;

  read<R>(reader: Reader<R>, raw: R): T;
}

/**
 * W: Write result type.
 */
export interface Writer<W> {
  writeAny(value: any): W;

  writeBoolean(value: boolean): W;

  writeBuffer(value: Uint8Array): W;

  writeDate(value: Date): W;

  writeDocument<K extends string>(keys: Iterable<K>, handler: <FW>(key: K, fieldWriter: Writer<FW>) => FW): W;

  writeFloat64(value: number): W;

  writeList(size: number, handler: <IW>(index: number, itemWriter: Writer<IW>) => IW): W;

  writeMap(
    size: number,
    keyHandler: <KW>(index: number, mapKeyWriter: Writer<KW>) => KW,
    valueHandler: <VW>(index: number, mapValueWriter: Writer<VW>) => VW,
  ): W;

  writeNull(): W;

  writeString(value: string): W;
}

/**
 * T: Return type of the read-visitor. This is the type of the value you actually want to create.
 */
export interface ReadVisitor<T> {
  fromBoolean(input: boolean): T;

  fromBuffer(input: Uint8Array): T;

  fromDate(input: Date): T;

  fromFloat64(input: number): T;

  fromList<RI>(input: Iterable<RI>, itemReader: Reader<RI>): T;

  fromMap<RK, RV>(input: Map<RK, RV>, keyReader: Reader<RK>, valueReader: Reader<RV>): T;

  fromNull(): T;

  fromString(input: string): T;
}

/**
 * R: Raw input type.
 */
export interface Reader<R> {
  /**
   * Boolean indicating that this reader wishes to opt-out of unneeded data validity checks.
   */
  trustInput?: boolean;

  readAny<T>(raw: R, visitor: ReadVisitor<T>): T;

  readBoolean<T>(raw: R, visitor: ReadVisitor<T>): T;

  readBuffer<T>(raw: R, visitor: ReadVisitor<T>): T;

  readDate<T>(raw: R, visitor: ReadVisitor<T>): T;

  readDocument<T>(raw: R, visitor: ReadVisitor<T>): T;

  readFloat64<T>(raw: R, visitor: ReadVisitor<T>): T;

  readList<T>(raw: R, visitor: ReadVisitor<T>): T;

  readMap<T>(raw: R, visitor: ReadVisitor<T>): T;

  readNull<T>(raw: R, visitor: ReadVisitor<T>): T;

  readString<T>(raw: R, visitor: ReadVisitor<T>): T;
}

export interface VersionedType<T, Diff> extends Type<T> {
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
