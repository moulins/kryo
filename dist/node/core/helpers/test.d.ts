import { Type, TypeSync } from "via-core";
export interface RunTestItem {
    name?: string;
    value: any;
    message: string;
}
export declare function runTestSync<T, D>(type: TypeSync<T, D>, items: RunTestItem[]): void;
export declare function runTest<T, D>(type: Type<T, D>, items: RunTestItem[]): void;
export interface runReadWriteOptions<T, D> {
    type: Type<T, D>;
    value: T;
    format: string;
    message: string;
}
export declare function runReadWrite<T, D>(options: runReadWriteOptions<T, D>): void;
