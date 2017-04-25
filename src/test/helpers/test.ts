import * as Bluebird from "bluebird";
import {assert} from "chai";
import {
  Dictionary,
  SerializableTypeAsync,
  SerializableTypeSync,
  TypeAsync,
  TypeSync
} from "../../lib/interfaces";

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
  serialized?: Dictionary<SerializationValues>;
}

export type TypedValue = InvalidTypedValue | ValidTypedValue;

function getName(namedValue: NamedValue) {
  return "name" in namedValue ? namedValue.name : JSON.stringify(namedValue.value);
}

export function testInvalidValueSync(type: TypeSync<any>, item: InvalidTypedValue) {
  it("Should return an Error for .testErrorSync", function () {
    assert.instanceOf(type.testErrorSync(item.value), Error);
  });

  it("Should return `false` for .testSync", function () {
    assert.isFalse(type.testSync(item.value));
  });
}

export function testInvalidAsync(type: TypeAsync<any>, item: InvalidTypedValue) {
  it("Should return an Error for .testErrorAsync", function () {
    return Bluebird.try(async function () {
      const result: Error | null = await type.testErrorAsync(item.value);
      assert.instanceOf(result, Error);
    });
  });

  it("Should return `false` for .testAsync", function () {
    return Bluebird.try(async function () {
      const result: boolean = await type.testAsync(item.value);
      assert.isFalse(result);
    });
  });
}

export function testValidValueSync(type: TypeSync<any>, item: ValidTypedValue) {
  it("Should return `null` for .testErrorSync", function () {
    const error: Error | null = type.testErrorSync(item.value);
    assert.isNull(error);
  });

  it("Should return `true` for .testSync", function () {
    assert.isTrue(type.testSync(item.value));
  });
}

export function testValidAsync(type: TypeAsync<any>, item: ValidTypedValue) {
  it("Should return `null` for .testErrorAsync", function () {
    return Bluebird
      .try(() => type.testErrorAsync(item.value))
      .then((res) => assert.equal(res, null));
  });

  it("Should return `true` for .testAsync", function () {
    return Bluebird
      .try(() => type.testAsync(item.value))
      .then((result) => assert.isTrue(result));
  });
}

export function testSerializableSync<T, S>(type: SerializableTypeSync<T, "json-doc", S>,
                                           typedValue: ValidTypedValue): void {
  // Simple serialization/deserialization
  it(`Should return the same content after a synchronous write/readTrusted to JSON`, function () {
    const exported: S = type.writeSync("json-doc", typedValue.value);
    const serialized: string = JSON.stringify(exported);
    const deserialized: S = JSON.parse(serialized);
    const imported: T = type.readTrustedSync("json-doc", deserialized);
    assert.isTrue(type.testSync(imported));
    assert.isTrue(type.equalsSync(imported, typedValue.value));
  });

  it(`Should return the same content after a synchronous write/read to JSON`, function () {
    const exported: S = type.writeSync("json-doc", typedValue.value);
    const serialized: string = JSON.stringify(exported);
    const deserialized: S = JSON.parse(serialized);
    const imported: T = type.readSync("json-doc", deserialized);
    assert.isTrue(type.testSync(imported));
    assert.isTrue(type.equalsSync(imported, typedValue.value));
  });

  // Checked serialization
  if (typedValue.serialized === undefined || !("json-doc" in typedValue.serialized)) {
    return;
  }

  const jsonSerialization: SerializationValues = typedValue.serialized["json-doc"];

  if ("canonical" in jsonSerialization) {
    const canonical: S = jsonSerialization.canonical;

    it(`Should return the canonical value for write: ${JSON.stringify(canonical)}`, function () {
      const exported: S = type.writeSync("json-doc", typedValue.value);
      assert.deepEqual(exported, canonical);
    });
  }

  // Checked deserialization

  if (jsonSerialization.values === undefined) {
    return;
  }

  for (const item of jsonSerialization.values) {
    if (item.valid) {
      it(`.read (format: "json-doc") should accept: ${getName(item)}`, function () {
        const imported: T = type.readSync("json-doc", item.value);
        assert.isTrue(type.testSync(imported));
      });
    } else {
      it(`.read (format: "json-doc") should reject: ${getName(item)}`, function () {
        assert.throw(() => {
          type.readSync("json-doc", item.value);
        });
      });
    }
  }
}

export function testSerializableAsync<T, S>(type: SerializableTypeAsync<T, "json-doc", S>, item: ValidTypedValue) {
  it(`Should return the same content after an asynchronous write/readTrusted to JSON`, function () {
    return Bluebird.try(async function () {
      const dehydrated: S = await type.writeAsync("json-doc", item.value);
      const serialized: string = JSON.stringify(dehydrated);
      const deserialized: S = JSON.parse(serialized);
      const hydrated: T = await type.readTrustedAsync("json-doc", deserialized);
      assert.isTrue(await type.testAsync(hydrated));
      assert.isTrue(await type.equalsAsync(hydrated, item.value));
    });
  });

  it(`Should return the same content after an asynchronous write/read to JSON`, function () {
    return Bluebird.try(async function () {
      const dehydrated: S = await type.writeAsync("json-doc", item.value);
      const serialized: string = JSON.stringify(dehydrated);
      const deserialized: S = JSON.parse(serialized);
      const hydrated: T = await type.readAsync("json-doc", deserialized);
      assert.isTrue(await type.testAsync(hydrated));
      assert.isTrue(await type.equalsAsync(hydrated, item.value));
    });
  });
}

export function testValueSync(type: TypeSync<any>, item: TypedValue): void;
export function testValueSync(type: SerializableTypeSync<any, any, any>, item: TypedValue): void;
export function testValueSync(type: any, item: any): any {
  if (item.valid) {
    testValidValueSync(type, item);
    if (type.isSerializable) {
      testSerializableSync(type, item);
    }
  } else {
    testInvalidValueSync(type, item);
  }
}

export function runTests(type: TypeSync<any>, items: TypedValue[]): void;
export function runTests(type: SerializableTypeSync<any, any, any>, items: TypedValue[]): void;
export function runTests(type: TypeAsync<any>, items: TypedValue[]): void;
export function runTests(type: SerializableTypeAsync<any, any, any>, items: TypedValue[]): void;
export function runTests(type: any, items: any): any {
  for (const item of items) {
    describe(`Item: ${getName(item)}`, function () {
      testValueSync(type, item);
    });
  }
}
