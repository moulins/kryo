import {BSON} from "bson";
import {assert} from "chai";
import * as qs from "qs";
import {SerializableType, Type} from "../../lib/interfaces";

export interface NamedValue {
  name?: string;
  value: any;
}

export interface CheckedValue extends NamedValue {
  valid: boolean;
}

export interface InvalidTypedValue extends CheckedValue {
  valid: boolean;
  testError?: Error;
}

export interface SerializationValues {
  canonical?: any;
  values?: CheckedValue[];
}

export interface ValidTypedValue extends CheckedValue {
  valid: boolean;

  /**
   * Between a format name and serialization values
   */
  serialized?: {
    [formatName: string]: SerializationValues;
  };
}

export type TypedValue = InvalidTypedValue | ValidTypedValue;

function getName(namedValue: NamedValue) {
  return "name" in namedValue ? namedValue.name : JSON.stringify(namedValue.value);
}

export function testInvalidValueSync(type: Type<any>, item: InvalidTypedValue) {
  it("Should return an Error for .testErrorSync", function () {
    assert.instanceOf(type.testError(item.value), Error);
  });

  it("Should return `false` for .testSync", function () {
    assert.isFalse(type.test(item.value));
  });
}

export function testValidValueSync(type: Type<any>, item: ValidTypedValue) {
  it("Should return `undefined` for .testErrorSync", function () {
    const error: Error | undefined = type.testError(item.value);
    assert.isUndefined(error);
  });

  it("Should return `true` for .testSync", function () {
    assert.isTrue(type.test(item.value));
  });
}

export function testSerializableSync<T, S>(
  type: SerializableType<T, "bson", S, any>
    & SerializableType<T, "json", S, any>
    & SerializableType<T, "qs", S, any>,
  typedValue: ValidTypedValue
): void {
  // Simple serialization/deserialization
  it(`Should return the same content after a synchronous write/readTrusted to JSON`, function () {
    const exported: S = type.write("json", typedValue.value);
    const serialized: string = JSON.stringify(exported);
    const deserialized: S = JSON.parse(serialized);
    const imported: T = type.readTrusted("json", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`Should return the same content after a synchronous write/read to JSON`, function () {
    const exported: S = type.write("json", typedValue.value);
    const serialized: string = JSON.stringify(exported);
    const deserialized: S = JSON.parse(serialized);
    const imported: T = type.read("json", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`Should return the same content after a synchronous write/readTrusted to BSON`, function () {
    const exported: S = type.write("bson", typedValue.value);
    const serialized: Buffer = new BSON().serialize({wrapper: exported});
    const deserialized: S = new BSON().deserialize(serialized).wrapper;
    const imported: T = type.readTrusted("bson", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`Should return the same content after a synchronous write/read to BSON`, function () {
    const exported: S = type.write("bson", typedValue.value);
    const serialized: Buffer = new BSON().serialize({wrapper: exported});
    const deserialized: S = new BSON().deserialize(serialized).wrapper;
    const imported: T = type.read("bson", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`Should return the same content after a synchronous write/readTrusted to the format used by qs`, function () {
    const exported: S = type.write("qs", typedValue.value);
    const serialized: string = qs.stringify({wrapper: exported});
    const deserialized: S = qs.parse(serialized).wrapper;
    const imported: T = type.readTrusted("qs", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it(`Should return the same content after a synchronous write/read to the format used by qs`, function () {
    const exported: S = type.write("qs", typedValue.value);
    const serialized: string = qs.stringify({wrapper: exported});
    const deserialized: S = qs.parse(serialized).wrapper;
    const imported: T = type.read("qs", deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  // Checked serialization
  if (typedValue.serialized === undefined || !("json" in typedValue.serialized)) {
    return;
  }

  const jsonSerialization: SerializationValues = typedValue.serialized["json"];

  if ("canonical" in jsonSerialization) {
    const canonical: S = jsonSerialization.canonical;

    it(`Should return the canonical value for write: ${JSON.stringify(canonical)}`, function () {
      const exported: S = type.write("json", typedValue.value);
      assert.deepEqual(exported, canonical);
    });
  }

  // Checked deserialization

  if (jsonSerialization.values === undefined) {
    return;
  }

  for (const item of jsonSerialization.values) {
    if (item.valid) {
      it(`.read (format: "json") should accept: ${getName(item)}`, function () {
        const imported: T = type.read("json", item.value);
        assert.isTrue(type.test(imported));
      });
    } else {
      it(`.read (format: "json") should reject: ${getName(item)}`, function () {
        assert.throw(() => {
          type.read("json", item.value);
        });
      });
    }
  }
}

export function testValueSync(type: SerializableType<any, any, any, any>, item: TypedValue): void;
export function testValueSync(type: any, item: any): any {
  if (item.valid) {
    testValidValueSync(type, item);
    testSerializableSync(type, item);
  } else {
    testInvalidValueSync(type, item);
  }
}

export function runTests(type: SerializableType<any, any, any, any>, items: TypedValue[]): void;
export function runTests(type: any, items: any): any {
  for (const item of items) {
    describe(`Item: ${getName(item)}`, function () {
      testValueSync(type, item);
    });
  }
}
