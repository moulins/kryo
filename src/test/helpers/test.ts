import { BSON } from "bson";
import { assert } from "chai";
import * as qs from "qs";
import { BsonSerializer, JsonSerializer, QsSerializer, Type } from "../../lib/types";

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

  output?: {
    [formatName: string]: any;
  };

  inputs?: {
    [formatName: string]: any;
  };

  invalidInputs?: {
    [formatName: string]: any;
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

export function testBsonSerialization<T, Input, Output extends Input>(
  type: Type<T> & BsonSerializer<T, Input, Output>,
  typedValue: ValidTypedValue,
): void {
  let actualSerialized: Buffer;

  if (typedValue.output !== undefined && "bson" in typedValue.output) {
    const output: Output = typedValue.output["bson"];
    const expectedSerialized: Buffer = new BSON().serialize({wrapper: output});
    it("`.writeBson(val)` should return the expected value", function () {
      const exported: Output = type.writeBson(typedValue.value);
      actualSerialized = new BSON().serialize({wrapper: exported});
      assert.deepEqual(actualSerialized, expectedSerialized);
    });
  } else {
    it("`t.writeBson(val)` should not throw", function () {
      const exported: Output = type.writeBson(typedValue.value);
      actualSerialized = new BSON().serialize({wrapper: exported});
    });
  }

  it("`t.readTrustedBson(t.writeBson(val))` should be valid and equal to `val`", function () {
    const deserialized: Output = new BSON().deserialize(actualSerialized).wrapper;
    const imported: T = type.readTrustedBson(deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readBson(t.writeBson(val))` should be valid and equal to `val`", function () {
    const deserialized: Output = new BSON().deserialize(actualSerialized).wrapper;
    const imported: T = type.readBson(deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testJsonSerialization<T, Input, Output extends Input>(
  type: Type<T> & JsonSerializer<T, Input, Output>,
  typedValue: ValidTypedValue,
): void {
  let actualSerialized: string;

  if (typedValue.output !== undefined && "json" in typedValue.output) {
    const output: Output = typedValue.output["json"];
    const expectedSerialized: string = JSON.stringify(output);
    it(`\`.writeJson(val)\` should return \`${expectedSerialized}\``, function () {
      const exported: Output = type.writeJson(typedValue.value);
      actualSerialized = JSON.stringify(exported);
      assert.deepEqual(exported, output);
    });
  } else {
    it("`t.writeJson(val)` should not throw", function () {
      const exported: Output = type.writeJson(typedValue.value);
      actualSerialized = JSON.stringify(exported);
    });
  }

  it("`t.readTrustedJson(t.writeJson(val))` should be valid and equal to `val`", function () {
    const deserialized: Output = JSON.parse(actualSerialized);
    const imported: T = type.readTrustedJson(deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readJson(t.writeJson(val))` should be valid and equal to `val`", function () {
    const deserialized: Output = JSON.parse(actualSerialized);
    const imported: T = type.readJson(deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testQsSerialization<T, Input, Output extends Input>(
  type: Type<T> & QsSerializer<T, Input, Output>,
  typedValue: ValidTypedValue,
): void {
  let actualSerialized: string;

  if (typedValue.output !== undefined && "qs" in typedValue.output) {
    if (typedValue.output["qs"] === "ignore") {
      return;
    }
    const output: Output = typedValue.output["qs"];
    const expectedSerialized: string = qs.stringify({wrapper: output});
    it(`\`.writeQs(val)\` should return the wrapped value \`${expectedSerialized}\``, function () {
      const exported: Output = type.writeQs(typedValue.value);
      actualSerialized = qs.stringify({wrapper: exported});
      assert.deepEqual(exported, output);
    });
  } else {
    it("`t.writeQs(val)` should not throw", function () {
      const exported: Output = type.writeQs(typedValue.value);
      actualSerialized = qs.stringify({wrapper: exported});
    });
  }

  it("`t.readTrustedQs(t.writeQs(val))` should be valid and equal to `val`", function () {
    const deserialized: Output = qs.parse(actualSerialized).wrapper;
    const imported: T = type.readTrustedQs(deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readQs(t.writeQs(val))` should be valid and equal to `val`", function () {
    const deserialized: Output = qs.parse(actualSerialized).wrapper;
    const imported: T = type.readQs(deserialized);
    assert.isTrue(type.test(imported));
    assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testSerialization<T>(
  type: Type<T> & BsonSerializer<T> & JsonSerializer<T> & QsSerializer<T>,
  typedValue: ValidTypedValue,
): void {
  testBsonSerialization(type, typedValue);
  testJsonSerialization(type, typedValue);
  testQsSerialization(type, typedValue);
}

export function testValueSync(
  type: Type<any> & BsonSerializer<any> & JsonSerializer<any> & QsSerializer<any>,
  item: TypedValue,
): void {
  if (item.valid) {
    testValidValueSync(type, item);
    testSerialization(type, item);
  } else {
    testInvalidValueSync(type, item);
  }
}

export function runTests(
  type: Type<any> & BsonSerializer<any> & JsonSerializer<any> & QsSerializer<any>,
  items: TypedValue[],
): void {
  for (const item of items) {
    describe(`Item: ${getName(item)}`, function () {
      testValueSync(type, item);
    });
  }
}
