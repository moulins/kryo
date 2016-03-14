import * as Promise from "bluebird";
import {TypeAsync, TypeSync, Type} from "./type";

export interface CollectionTypeAsync<T, D> extends TypeAsync<T, D> {
  reflect(visitor: (value?: T, key?: any, parent?: CollectionType<any, any>) => any): Promise<any>;
}

export interface CollectionTypeSync<T, D> extends TypeSync<T, D> {
  reflectSync(visitor: (value?: T, key?: any, parent?: CollectionType<any, any>) => any): any;
}

export interface CollectionType<T, D> extends CollectionTypeAsync<T, D>, Type<T, D> {
  reflectSync?(visitor: (value?: T, key?: any, parent?: CollectionType<any, any>) => any): any;
}
