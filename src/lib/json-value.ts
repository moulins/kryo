export type JsonBaseValue = boolean | string | null | number | {[P in keyof any]: JsonValue};

export interface JsonArrayValue extends Array<JsonValue> {
}

export type JsonValue = JsonArrayValue | JsonBaseValue;
