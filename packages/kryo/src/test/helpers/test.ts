import bson from "bson";
import chai from "chai";
import qs from "qs";

import { IoType, Type } from "../../lib/core.js";
import { BsonReader } from "../../lib/readers/bson.js";
import { JsonReader } from "../../lib/readers/json.js";
import { QsReader } from "../../lib/readers/qs.js";
import { BsonWriter } from "../../lib/writers/bson.js";
import { JsonWriter } from "../../lib/writers/json.js";
import { QsWriter } from "../../lib/writers/qs.js";

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

export function testInvalidValue(type: Type<any>, item: InvalidTypedValue) {
  if (type.testError !== undefined) {
    it("Should return an Error for .testError", function () {
      chai.assert.instanceOf(type.testError!(item.value), Error);
    });
  }

  it("Should return `false` for .test", function () {
    chai.assert.isFalse(type.test(item.value));
  });
}

export function testValidValue(type: Type<any>, item: ValidTypedValue) {
  if (type.testError !== undefined) {
    it("Should return `undefined` for .testError", function () {
      const error: Error | undefined = type.testError!(item.value);
      if (error !== undefined) {
        chai.assert.fail(error, undefined, String(error));
      }
    });
  }

  it("Should return `true` for .test", function () {
    chai.assert.isTrue(type.test(item.value));
  });
}

export function testBsonSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  const writer: BsonWriter = new BsonWriter(bson);
  const reader: BsonReader = new BsonReader(bson);
  const trustedReader: BsonReader = new BsonReader(bson, true);
  let actualSerialized: Buffer;

  if (typedValue.output !== undefined && "bson" in typedValue.output) {
    const output: any = typedValue.output["bson"];
    it("`.writeBson(val)` should return the expected value", function () {
      actualSerialized = type.write(writer, typedValue.value);
      chai.assert.deepEqual(actualSerialized, output);
    });
  } else {
    it("`t.writeBson(val)` should not throw", function () {
      actualSerialized = type.write(writer, typedValue.value);
    });
  }

  it("`t.readTrustedBson(t.writeBson(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(trustedReader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readBson(t.writeBson(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(reader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testJsonSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  const writer: JsonWriter = new JsonWriter();
  const reader: JsonReader = new JsonReader();
  const trustedReader: JsonReader = new JsonReader(true);
  let actualSerialized: string;

  if (typedValue.output !== undefined && "json" in typedValue.output) {
    const output: any = typedValue.output["json"];
    const expectedSerialized: string = JSON.stringify(output);
    it(`\`.writeJson(val)\` should return \`${expectedSerialized}\``, function () {
      actualSerialized = type.write(writer, typedValue.value);
      chai.assert.strictEqual(actualSerialized, output);
    });
  } else {
    it("`t.writeJson(val)` should not throw", function () {
      actualSerialized = type.write(writer, typedValue.value);
    });
  }

  it("`t.readTrustedJson(t.writeJson(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(trustedReader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readJson(t.writeJson(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(reader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testQsSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  const writer: QsWriter = new QsWriter(qs);
  const reader: QsReader = new QsReader(qs);
  const trustedReader: QsReader = new QsReader(qs, true);
  let actualSerialized: string;

  if (typedValue.output !== undefined && "qs" in typedValue.output) {
    if (typedValue.output["qs"] === "ignore") {
      return;
    }
    const expectedSerialized: string = typedValue.output["qs"];
    it(`\`.writeQs(val)\` should return the value \`${expectedSerialized}\``, function () {
      actualSerialized = type.write(writer, typedValue.value);
      chai.assert.strictEqual(actualSerialized, expectedSerialized);
    });
  } else {
    it("`t.writeQs(val)` should not throw", function () {
      actualSerialized = type.write(writer, typedValue.value);
    });
  }

  it("`t.readTrustedQs(t.writeQs(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(trustedReader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });

  it("`t.readQs(t.writeQs(val))` should be valid and equal to `val`", function () {
    const imported: T = type.read!(reader, actualSerialized);
    chai.assert.isTrue(type.test(imported));
    chai.assert.isTrue(type.equals(imported, typedValue.value));
  });
}

export function testSerialization<T>(type: IoType<T>, typedValue: ValidTypedValue): void {
  testBsonSerialization(type, typedValue);
  testJsonSerialization(type, typedValue);
  testQsSerialization(type, typedValue);
}

export function testValueSync(type: Type<any>, item: TypedValue): void {
  if (item.valid) {
    testValidValue(type, item);
    testSerialization(type as IoType<any>, item);
  } else {
    testInvalidValue(type, item);
  }
}

export function runTests(type: Type<any>, items: TypedValue[]): void {
  for (const item of items) {
    describe(`Item: ${getName(item)}`, function () {
      testValueSync(type, item);
    });
  }
}
