/**
 * This module defines most of the Typescript interfaces and type aliases used by Kryo.
 *
 * @module kryo/core
 */

/**
 * Represents a lazy value of type `T`.
 * You can retrieve it with `const val = typeof lazy === "function" ? lazy() : lazy;`.
 * This library guarantees that it will be only called once but you should still ensure that it is idempotent.
 */
export type Lazy<T> = T | (() => T);

/**
 * Simple type interface.
 *
 * This is the smallest interface for objects to be valid types.
 * A type with this interface can check the validity and equality of values, and clone them.
 */
export interface Type<T> {
  /**
   * Name of this type. This is only used to help with debugging.
   */
  name?: string;

  /**
   * Tests if this type matches `value`, describes the error if not.
   *
   * @param value The value to test against this type.
   * @return If this type matches `value` then `undefined`; otherwise an error describing why this
   *         type does not match `value`.
   */
  testError(value: T): Error | undefined;

  /**
   * Tests if this type matches `value`.
   *
   * @param value The value to test against this type.
   * @return Boolean indicating if this type matches `value`.
   */
  test(value: T): boolean;

  /**
   * Tests if `left` is equal to `value`.
   *
   * This is a deep strict structural equality test restricted to the properties of this type.
   *
   * It satisfies the following properties (the variables `a`, `b` and `c` are valid values):
   * - Reflexivity: `type.equal(a, a) === true`
   * - Symmetry: `type.equals(a, b) === type.equals(b, a)`
   * - Transitivity: if `type.equals(a, b) && type.equals(b, c)` then `type.equals(a, c)`
   *
   * The above properties mean that type objects implement the `Setoid` algebra as specified by
   * Static Land.
   *
   * @see https://github.com/rpominov/static-land/blob/master/docs/spec.md#setoid
   * @param left Left value, trusted to be compatible with this type.
   * @param right Right value, trusted to be compatible with this type.
   * @return Boolean indicating if both values are equal.
   */
  equals(left: T, right: T): boolean;

  /**
   * Returns a deep copy of `value`.
   *
   * @param value The value to clone, trusted to be compatible with this type.
   * @return A deep copy of the supplied value, restricted to the properties of this type.
   */
  clone(value: T): T;

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

  writeBytes(value: Uint8Array): W;

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

  fromBytes(input: Uint8Array): T;

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

  readBytes<T>(raw: R, visitor: ReadVisitor<T>): T;

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
