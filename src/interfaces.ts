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
  isCollection: boolean;
  type: string;
  types: string[];
  toJSON(): any;
}

export interface TypeSync<T> extends TypeBase {
  isSync: boolean;  // TODO: use literal `true` once available

  readTrustedSync (format: "json-doc" | "bson-doc", val: any): T;
  readSync (format: "json-doc" | "bson-doc", val: any): T;
  writeSync (format: "json-doc" | "bson-doc", val: T): any;
  testErrorSync (val: any): Error;
  testSync (val: any): boolean;
  equalsSync (val1: T, val2: T): boolean;
  cloneSync (val: T): T;
}

export interface TypeAsync<T> extends TypeBase {
  isAsync: boolean;  // TODO: use literal `true` once available

  readTrustedAsync (format: "json-doc" | "bson-doc", val: any): PromiseLike<T>;
  readAsync (format: "json-doc" | "bson-doc", val: any): PromiseLike<T>;
  writeAsync (format: "json-doc" | "bson-doc", val: T): PromiseLike<any>;
  testErrorAsync (val: any): PromiseLike<Error>;
  testAsync (val: any): PromiseLike<boolean>;
  equalsAsync (val1: T, val2: T): PromiseLike<boolean>;
  cloneAsync (val: T): PromiseLike<T>;
}

export type Type<T> = TypeAsync<T> | TypeSync<T>;

export interface VersionedTypeSync<T, D> extends TypeSync<T> {
  diffSync (oldVal: T, newVal: T): D | null;
  patchSync (oldVal: T, diff: D | null): T;
  reverseDiffSync (diff: D | null): D;
}

export interface VersionedTypeAsync<T, D> extends TypeAsync<T> {
  diffAsync (oldVal: T, newVal: T): PromiseLike<D | null>;
  patchAsync (oldVal: T, diff: D | null): PromiseLike<T>;
  reverseDiffAsync (diff: D | null): PromiseLike<D>;
}

export type VersionedType<T, D> = VersionedTypeAsync<T, D> | VersionedTypeSync<T, D>;

export interface StaticTypeSync<T, D, O> {
  new(options: O): TypeSync<T>;
}

export interface StaticTypeAsync<T, D, O> {
  new(options: O): TypeAsync<T>;
}

export interface StaticType<T, D, O> {
  new(options: O): Type<T>;
}

// I stands for Item
//noinspection TypeScriptUnresolvedVariable
export interface CollectionTypeAsync <T, D, I> extends TypeAsync<T> {
  isCollection: boolean;  // TODO: use literal `true` once available
  iterateAsync (value: T): IteratorResult<PromiseLike<I>>;
}

//noinspection TypeScriptUnresolvedVariable
export interface CollectionTypeSync <T, D, I> extends TypeAsync<T> {
  isCollection: boolean;  // TODO: use literal `true` once available
  iterateSync (value: T): IteratorResult<I>;
}

export interface VersionedCollectionTypeSync<T, D, I> extends
  CollectionTypeSync <T, D, I>,
  VersionedTypeSync<T, D> {}
export interface VersionedCollectionTypeAsync<T, D, I> extends
  CollectionTypeAsync <T, D, I>,
  VersionedTypeAsync<T, D> {}

// export interface CollectionTypeAsync<T, D> extends TypeAsync<T, D> {
//   reflect(visitor: (value?: any, key?: any, parent?: CollectionType<any, any>) => any, options?: any): Thenable<any>;
//   diffToUpdate (newVal: T, diff: D, format: string): Thenable<UpdateQuery>
// }
//
// export interface CollectionTypeSync<T, D> extends TypeSync<T, D> {
//   reflectSync(visitor: (value?: any, key?: any, parent?: CollectionType<any, any>) => any, options?: any): any;
// }
//
// export interface CollectionType<T, D> extends CollectionTypeAsync<T, D>, Type<T, D> {
//   reflectSync?(visitor: (value?: any, key?: any, parent?: CollectionType<any, any>) => any, options?: any): any;
// }
