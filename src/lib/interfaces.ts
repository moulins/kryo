export interface Dictionary<T> {
  [key: string]: T;
}

export interface NumericDictionary<T> {
  [key: number]: T;
}

export type Document = Dictionary<any>;

export interface TypeBase {
  isSync: boolean;
  isAsync: boolean;
  isSerializable: boolean;
  isVersioned: boolean;
  isCollection: boolean;
  type: string;
  types: string[];
  toJSON(): any;
}

// Synchronous interfaces

export interface TypeSync<T> extends TypeBase {
  isSync: true;

  testErrorSync (val: any): Error | null;
  testSync (val: any): boolean;
  equalsSync (val1: T, val2: T): boolean;
  cloneSync (val: T): T;
}

export interface SerializableTypeSync<T, F extends string, S> extends TypeSync<T> {
  isSerializable: true;

  readTrustedSync (format: F, serialized: S): T;
  readSync (format: F, serialized: any): T;
  writeSync (format: F, val: T): S;
}

export interface VersionedTypeSync<T, S, D> extends SerializableTypeSync<T, "json-doc", S> {
  isVersioned: true;

  /**
   * Returns null if both values are equivalent, otherwise a diff representing the change from
   * oldVal to newVal.
   *
   * @param oldVal The old value
   * @param newVal The new value
   */
  diffSync (oldVal: T, newVal: T): D | null;
  patchSync (oldVal: T, diff: D | null): T;
  reverseDiffSync (diff: D | null): D | null;
}

export interface CollectionTypeSync <T, D, I> extends TypeSync<T> {
  isCollection: true;

  iterateSync (value: T, visitor: Function): any;
}

// Asynchronous interfaces

export interface TypeAsync<T> extends TypeBase {
  isAsync: true;

  testErrorAsync (val: any): Promise<Error | null>;
  testAsync (val: any): Promise<boolean>;
  equalsAsync (val1: T, val2: T): Promise<boolean>;
  cloneAsync (val: T): Promise<T>;
}

export interface SerializableTypeAsync<T, F extends string, S> extends TypeAsync<T> {
  isSerializable: true;

  readTrustedAsync (format: F, serialized: S): Promise<T>;
  readAsync (format: F, serialized: any): Promise<T>;
  writeAsync (format: F, val: T): Promise<S>;
}

export interface VersionedTypeAsync<T, S, D> extends SerializableTypeAsync<T, "json-doc", S> {
  isVersioned: true;
  diffAsync (oldVal: T, newVal: T): Promise<D | null>;
  patchAsync (oldVal: T, diff: D | null): Promise<T>;
  reverseDiffAsync (diff: D | null): Promise<D | null>;
}

export interface CollectionTypeAsync <T, D, I> extends TypeAsync<T> {
  isCollection: true;
  iterateAsync (value: T, visitor: Function): any;
}

// Other

export type Type<T> = TypeAsync<T> | TypeSync<T>;
export type SerializableType<T, F extends string, S> = SerializableTypeAsync<T, F, S> | SerializableTypeSync<T, F, S>;
export type VersionedType<T, S, D> = VersionedTypeAsync<T, S, D> | VersionedTypeSync<T, S, D>;

export interface VersionedCollectionTypeSync<T, S, D, I> extends
  CollectionTypeSync <T, D, I>,
  VersionedTypeSync<T, S, D>
{
  isCollection: true;
  isVersioned: true;
  isSerializable: true;
}

export interface VersionedCollectionTypeAsync<T, S, D, I> extends
  CollectionTypeAsync <T, D, I>,
  VersionedTypeAsync<T, S, D>
{
  isCollection: true;
  isVersioned: true;
  isSerializable: true;
}
