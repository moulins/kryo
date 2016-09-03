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
  isSync: boolean;  // TODO: use literal `true` once available

  testErrorSync (val: any): Error | null;
  testSync (val: any): boolean;
  equalsSync (val1: T, val2: T): boolean;
  cloneSync (val: T): T;
}

export interface SerializableTypeSync<F extends string, T, S> extends TypeSync<T> {
  isSerializable: boolean;  // TODO: use literal `true` once available

  readTrustedSync (format: F, serialized: S): T;
  readSync (format: F, serialized: any): T;
  writeSync (format: F, val: T): S;
}

export interface VersionedTypeSync<T, D> extends TypeSync<T> {
  isVersioned: boolean;  // TODO: use literal `true` once available

  diffSync (oldVal: T, newVal: T): D | null;
  patchSync (oldVal: T, diff: D | null): T;
  reverseDiffSync (diff: D | null): D;
}

export interface CollectionTypeSync <T, D, I> extends TypeSync<T> {
  isCollection: boolean;  // TODO: use literal `true` once available

  iterateSync (value: T, visitor: Function): any;
}

// Asynchronous interfaces

export interface TypeAsync<T> extends TypeBase {
  isAsync: boolean;  // TODO: use literal `true` once available

  testErrorAsync (val: any): PromiseLike<Error | null>;
  testAsync (val: any): PromiseLike<boolean>;
  equalsAsync (val1: T, val2: T): PromiseLike<boolean>;
  cloneAsync (val: T): PromiseLike<T>;
}

export interface SerializableTypeAsync<F extends string, T, S> extends TypeAsync<T> {
  isSerializable: boolean;  // TODO: use literal `true` once available

  readTrustedAsync (format: F, serialized: S): PromiseLike<T>;
  readAsync (format: F, serialized: any): PromiseLike<T>;
  writeAsync (format: F, val: T): PromiseLike<S>;
}

export interface VersionedTypeAsync<T, D> extends TypeAsync<T> {
  isVersioned: boolean;  // TODO: use literal `true` once available

  diffAsync (oldVal: T, newVal: T): PromiseLike<D | null>;
  patchAsync (oldVal: T, diff: D | null): PromiseLike<T>;
  reverseDiffAsync (diff: D | null): PromiseLike<D>;
}

export interface CollectionTypeAsync <T, D, I> extends TypeAsync<T> {
  isCollection: boolean;  // TODO: use literal `true` once available

  iterateAsync (value: T, visitor: Function): any;
}

// Other

export type Type<T> = TypeAsync<T> | TypeSync<T>;
export type VersionedType<T, D> = VersionedTypeAsync<T, D> | VersionedTypeSync<T, D>;

export interface VersionedCollectionTypeSync<T, D, I> extends
  CollectionTypeSync <T, D, I>,
  VersionedTypeSync<T, D> {}
export interface VersionedCollectionTypeAsync<T, D, I> extends
  CollectionTypeAsync <T, D, I>,
  VersionedTypeAsync<T, D> {}
