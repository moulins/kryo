import {TypeSync} from "../interfaces/type";
import * as chai from "chai";
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
