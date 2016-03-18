import {Type, TypeSync} from "via-core";
import * as chai from "chai";
import * as _ from "lodash";
import * as Promise from "bluebird";

let assert = chai.assert;

export interface TypeTestItem {
  name?: string;
  value: any;
  message: string;
}

export function runTypeTestSync<T, D>(type: TypeSync<T, D>, items: TypeTestItem[]): void {
  for (let item of items) {
    if (!("name" in item)) {
      item.name = String(item.value);
    }

    it(`#testSync should match correctly for: ${item.name}`, () => {
      try {
        let result: Error = type.testSync(item.value);
        if (item.message === null) {
          assert.strictEqual(result, null);
        } else {
          assert.instanceOf(result, Error);
          if (item.message === "") {
            // console.warn("Supplied empty error message");
          } else {
            assert.strictEqual(result.message, item.message);
          }
        }
      } catch (err) {
        throw err;
      }
    });
  }
}

export function runTypeTest<T, D>(type: Type<T, D>, items: TypeTestItem[]): void {
  for (let item of items) {
    if (!("name" in item)) {
      item.name = String(item.value);
    }

    it(`#testSync should match correctly for: ${item.name}`, () => {
      return type
        .test(item.value)
        .then((result: Error) => {
          if (item.message === null) {
            assert.strictEqual(result, null);
          } else {
            assert.instanceOf(result, Error);
            if (item.message === "") {
              // console.warn("Supplied empty error message");
            } else {
              assert.strictEqual(result.message, item.message);
            }
          }
        });
    });
  }
}

