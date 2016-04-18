import {type} from "via-core";
import * as chai from "chai";
import * as _ from "lodash";
import * as Promise from "bluebird";

let assert = chai.assert;

export interface RunTestItem {
  name?: string;
  value: any;
  message: string;
  options?: any;
}

export function runTestSync<T, D>(type: type.TypeSync<T, D>, items: RunTestItem[]): void {
  for (let item of items) {
    if (!("name" in item)) {
      item.name = String(item.value);
    }

    it(`#testSync should match correctly for: ${item.name}`, () => {
      try {
        let result: Error = type.testSync(item.value, item.options);
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

export function runTest<T, D>(type: type.Type<T, D>, items: RunTestItem[]): void {
  for (let item of items) {
    if (!("name" in item)) {
      item.name = String(item.value);
    }

    it(`#test should match correctly for: ${item.name}`, () => {
      return type
        .test(item.value)
        .then((result: Error) => {
          if (item.message === null) {
            if (result !== null) {
              throw result;
            }
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

export interface runReadWriteOptions<T, D> {
  type: type.Type<T, D>;
  value: T;
  format: string;
  message: string;
}

export function runReadWrite<T, D>(options: runReadWriteOptions<T, D>): void {
  it(`#write #read #equals: ${options.message}`, () => {
    return options.type
      .write(options.format, options.value)
      .then((raw: any) => {
        let jsonClone = JSON.parse(JSON.stringify(raw));
        return options.type
          .read(options.format, jsonClone);
      })
      .then((result: T) => {
        return options.type
          .equals(result, options.value);
      })
      .then((equals: boolean) => {
        assert.strictEqual(equals, true);
      })
  });
}
