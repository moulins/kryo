import * as Bluebird from "bluebird";
import {assert} from "chai"

import {
  TypeAsync, TypeSync, SerializableTypeSync,
  SerializableTypeAsync
} from "../interfaces";

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

export interface ValidTypedValue extends CheckedValue {
  valid: boolean;
  serialized?: {
    [format: string]: {
      canonical?: any;
      values?: CheckedValue[]
    }
  }
}

export type TypedValue = InvalidTypedValue | ValidTypedValue;

function getName(namedValue: NamedValue) {
  return "name" in namedValue ? namedValue.name : JSON.stringify(namedValue.value);
}

export function testInvalidValueSync(type: TypeSync<any>, item: InvalidTypedValue) {
  it("Should return an Error for .testErrorSync", function() {
    assert.instanceOf(type.testErrorSync(item.value), Error);
  });

  it("Should return `false` for .testSync", function() {
    assert.isFalse(type.testSync(item.value));
  });
}

export function testInvalidAsync(type: TypeAsync<any>, item: InvalidTypedValue) {
  it("Should return an Error for .testErrorAsync", function() {
    return Bluebird.try(async function() {
      const result = await type.testErrorAsync(item.value);
      assert.instanceOf(result, Error);
    });
  });

  it("Should return `false` for .testAsync", function() {
    return Bluebird.try(async function() {
      const result = await type.testAsync(item.value);
      assert.isFalse(result);
    });
  });
}

export function testValidValueSync(type: TypeSync<any>, item: ValidTypedValue) {
  it("Should return `null` for .testErrorSync", function() {
    assert.equal(type.testErrorSync(item.value), null);
  });

  it("Should return `true` for .testSync", function() {
    assert.isTrue(type.testSync(item.value));
  });
}

export function testValidAsync(type: TypeAsync<any>, item: ValidTypedValue) {
  it("Should return `null` for .testErrorAsync", function() {
    return Bluebird
      .try(() => type.testErrorAsync(item.value))
      .then((res) => assert.equal(res, null));
  });

  it("Should return `true` for .testAsync", function() {
    return Bluebird
      .try(() => type.testAsync(item.value))
      .then((result) => assert.isTrue(result));
  });
}

export function testSerializableSync<T, S> (
  type: SerializableTypeSync<T, "json-doc", S>,
  typedValue: ValidTypedValue,
): void {

  // Blind serialization/deserialization

  it(`Should return the same content after a synchronous write/readTrusted to JSON`, function() {
    const exported = type.writeSync('json-doc', typedValue.value);
    const serialized = JSON.stringify(exported);
    const deserialized = JSON.parse(serialized);
    const imported = type.readTrustedSync('json-doc', deserialized);
    assert.isTrue(type.testSync(imported));
    assert.isTrue(type.equalsSync(imported, typedValue.value));
  });

  it(`Should return the same content after a synchronous write/read to JSON`, function() {
    const exported = type.writeSync('json-doc', typedValue.value);
    const serialized = JSON.stringify(exported);
    const deserialized = JSON.parse(serialized);
    const imported = type.readSync('json-doc', deserialized);
    assert.isTrue(type.testSync(imported));
    assert.isTrue(type.equalsSync(imported, typedValue.value));
  });

  // Checked serialization

  if (!("serialized" in typedValue && "json-doc" in typedValue.serialized)) {
    return;
  }

  const jsonSerialization = typedValue.serialized["json-doc"];

  if ("canonical" in jsonSerialization) {
    const canonical = jsonSerialization.canonical;

    it(`Should return the canonical value for write: ${canonical}`, function() {
      const exported = type.writeSync('json-doc', typedValue.value);
      assert.deepEqual(exported, canonical);
    });
  }

  // Checked deserialization

  if (!("values" in jsonSerialization)) {
    return;
  }

  for (const item of jsonSerialization.values) {
    if (item.valid) {
      it(`.read (format: "json-doc") should accept: ${getName(item)}`, function() {
        const imported: T = type.readSync('json-doc', item.value);
        assert.isTrue(type.testSync(imported));
      });
    } else {
      it(`.read (format: "json-doc") should reject: ${getName(item)}`, function() {
        assert.throw(() => {
          type.readSync('json-doc', item.value);
        });
      });
    }
  }
}

export function testSerializableAsync<T, S> (type: SerializableTypeAsync<T, "json-doc", S>, item: ValidTypedValue) {
  it(`Should return the same content after an asynchronous write/readTrusted to JSON`, function() {
    return Bluebird.try(async function() {
      const dehydrated = await type.writeAsync("json-doc", item.value);
      const serialized = JSON.stringify(dehydrated);
      const deserialized = JSON.parse(serialized);
      const hydrated = await type.readTrustedAsync("json-doc", deserialized);
      assert.isTrue(await type.testAsync(hydrated));
      assert.isTrue(await type.equalsAsync(hydrated, item.value));
    });
  });

  it(`Should return the same content after an asynchronous write/read to JSON`, function() {
    return Bluebird.try(async function() {
      const dehydrated = await type.writeAsync("json-doc", item.value);
      const serialized = JSON.stringify(dehydrated);
      const deserialized = JSON.parse(serialized);
      const hydrated = await type.readAsync("json-doc", deserialized);
      const isValid = await type.testAsync(hydrated);
      assert.isTrue(isValid);
      const isEqual = await type.equalsAsync(hydrated, item.value);
      assert.isTrue(isEqual);
    });
  });
}

export function testValueSync(type: TypeSync<any, any, any>, item: TypedValue): void;
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
  for (let item of items) {
    describe(`Item: ${getName(item)}`, function() {
      testValueSync(type, item);
    });
  }
}
