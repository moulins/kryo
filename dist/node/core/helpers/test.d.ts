import { TypeSync } from "via-core";
export interface TypeTestItem {
    name?: string;
    value: any;
    message: string;
}
export declare function runTypeTestSync<T, D>(type: TypeSync<T, D>, items: TypeTestItem[]): void;
