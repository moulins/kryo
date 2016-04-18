import { type } from "via-core";
import { StaticType, StaticTypeSync } from "./class-interfaces";
export declare function promisify<T, D>(typeSync: type.TypeSync<T, D>): type.Type<T, D>;
export declare function promisifyClass<T, D>(typeSync: StaticTypeSync<T, D>): StaticType<T, D>;
