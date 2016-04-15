import {Type, TypeSync} from "via-core";

export interface StaticTypeSync<T, D> {
  new(...args: any[]): TypeSync<T, D>;
  prototype?: TypeSync<T, D>;
}

export interface StaticType<T, D> {
  new(...args: any[]): Type<T, D>;
  prototype?: Type<T, D>;
}
