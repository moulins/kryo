import { type } from "via-core";
export interface StaticTypeSync<T, D> {
    new (options?: any): type.TypeSync<T, D>;
    prototype?: type.TypeSync<T, D>;
}
export interface StaticType<T, D> {
    new (options?: any): type.Type<T, D>;
    prototype?: type.Type<T, D>;
}
