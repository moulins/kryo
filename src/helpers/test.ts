import * as Bluebird from "bluebird";
import {assert} from "chai"

import {TypeAsync, TypeSync} from "../interfaces";

export interface TestItem {
  name: string;
  value: any;
  valid: boolean
}

export interface ValidItem extends TestItem {
  writeJSON?: string;
  readJSON?: string[];
}

export interface InvalidItem extends TestItem {
  error?: Error;
}

export function testInvalidSync(type: TypeSync<any>, item: InvalidItem) {
  it("Should return an Error for .testErrorSync", function() {
    assert.instanceOf(type.testErrorSync(item.value), Error);
  });

  it("Should return `false` for .testSync", function() {
    assert.isFalse(type.testSync(item.value));
  });
}

export function testInvalidAsync(type: TypeAsync<any>, item: InvalidItem) {
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

export function testValidSync(type: TypeSync<any>, item: InvalidItem) {
  it("Should return `null` for .testErrorSync", function() {
    assert.equal(type.testErrorSync(item.value), null);
  });

  it("Should return `true` for .testSync", function() {
    assert.isTrue(type.testSync(item.value));
  });
}

export function testValidAsync(type: TypeAsync<any>, item: InvalidItem) {
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

export function runTests(type: TypeSync<any> & TypeAsync<any>, items: TestItem[]) {
  for (let item of items) {
    describe(`Item ${item.name}`, function() {
      if (!item.valid) {
        if (type.isSync) {
          testInvalidSync(type, item);
        }
        if (type.isAsync) {
          testInvalidAsync(type, item);
        }
        return;
      }

      // From here, the item.valid === true

      if (type.isSync) {
        testValidSync(type, item);
      }
      if (type.isAsync) {
        testValidAsync(type, item);
      }

      // write/readTrusted
      it(`Should return the same content after a synchronous write/readTrusted to JSON`, function() {
        const dehydrated = type.writeSync('json-doc', item.value);
        const serialized = JSON.stringify(dehydrated);
        const deserialized = JSON.parse(serialized);
        const hydrated = type.readTrustedSync('json-doc', deserialized);
        assert.isTrue(type.testSync(hydrated));
        assert.isTrue(type.equalsSync(hydrated, item.value));
      });

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

      // write/read
      it(`Should return the same content after a synchronous write/read to JSON`, function() {
        const dehydrated = type.writeSync('json-doc', item.value);
        const serialized = JSON.stringify(dehydrated);
        const deserialized = JSON.parse(serialized);
        const hydrated = type.readSync('json-doc', deserialized);
        assert.isTrue(type.testSync(hydrated));
        assert.isTrue(type.equalsSync(hydrated, item.value));
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

    });
  }
}