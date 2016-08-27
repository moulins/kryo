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

export interface TypeSync<T, D, O> extends TypeBase {
  isSync: boolean;  // TODO: use literal `true` once available

  readTrustedSync (format: "json-doc" | "bson-doc", val: any): T;
  readSync (format: "json-doc" | "bson-doc", val: any): T;
  writeSync (format: "json-doc" | "bson-doc", val: T): any;
  testErrorSync (val: any): Error;
  testSync (val: any): boolean;
  equalsSync (val1: T, val2: T): boolean;
  cloneSync (val: T): T;
}

export interface TypeAsync<T, D, O> extends TypeBase {
  isAsync: boolean;  // TODO: use literal `true` once available

  readTrustedAsync (format: "json-doc" | "bson-doc", val: any): PromiseLike<T>;
  readAsync (format: "json-doc" | "bson-doc", val: any): PromiseLike<T>;
  writeAsync (format: "json-doc" | "bson-doc", val: T): PromiseLike<any>;
  testErrorAsync (val: any): PromiseLike<Error>;
  testAsync (val: any): PromiseLike<boolean>;
  equalsAsync (val1: T, val2: T): PromiseLike<boolean>;
  cloneAsync (val: T): PromiseLike<T>;
}

export type Type<T, D, O> = TypeAsync<T, D, O> | TypeSync<T, D, O>;

export interface VersionedTypeSync<T, D, O> extends TypeSync<T, D, O> {
  diffSync (oldVal: T, newVal: T): D | null;
  patchSync (oldVal: T, diff: D | null): T;
  reverseDiffSync (diff: D | null): D;
  squashSync (diff1: D | null, diff2: D | null): D | null;
}

export interface VersionedTypeAsync<T, D, O> extends TypeAsync<T, D, O> {
  diffAsync (oldVal: T, newVal: T): PromiseLike<D | null>;
  patchAsync (oldVal: T, diff: D | null): PromiseLike<T>;
  reverseDiffAsync (diff: D | null): PromiseLike<D>;
  squashAsync (diff1: D | null, diff2: D | null): PromiseLike<D | null>;
}

export type VersionedType<T, D, O> = VersionedTypeAsync<T, D, O> | VersionedTypeSync<T, D, O>;

export interface StaticTypeSync<T, D, O> {
  new(options: O): TypeSync<T, D, O>;
}

export interface StaticTypeAsync<T, D, O> {
  new(options: O): TypeAsync<T, D, O>;
}

export interface StaticType<T, D, O> {
  new(options: O): Type<T, D, O>;
}

// I stands for Item
//noinspection TypeScriptUnresolvedVariable
export interface CollectionTypeAsync <T, D, O, I> extends TypeAsync<T, D, O> {
  isCollection: boolean;  // TODO: use literal `true` once available
  iterateAsync (value: T): IteratorResult<PromiseLike<I>>;
}

//noinspection TypeScriptUnresolvedVariable
export interface CollectionTypeSync <T, D, O, I> extends TypeAsync<T, D, O> {
  isCollection: boolean;  // TODO: use literal `true` once available
  iterateSync (value: T): IteratorResult<I>;
}

export interface VersionedCollectionTypeSync<T, D, O, I> extends
  CollectionTypeSync <T, D, O, I>,
  VersionedTypeSync<T, D, O> {}
export interface VersionedCollectionTypeAsync<T, D, O, I> extends
  CollectionTypeAsync <T, D, O, I>,
  VersionedTypeAsync<T, D, O> {}

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
