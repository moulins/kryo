import chai from "chai";

import { BooleanType } from "../../lib/boolean.js";
import { assertKryoType, runTests, TypedValue } from "../helpers/test.js";

describe("BooleanType", function () {
  const $Boolean = new BooleanType();
  assertKryoType<typeof $Boolean, boolean>(true);

  const items: TypedValue[] = [
    {name: "true", value: true, valid: true},
    {name: "false", value: false, valid: true},

    // tslint:disable-next-line:no-construct
    {name: "new Boolean(true)", value: new Boolean(true), valid: false},
    // tslint:disable-next-line:no-construct
    {name: "new Boolean(false)", value: new Boolean(false), valid: false},
    {name: "0", value: 0, valid: false},
    {name: "1", value: 1, valid: false},
    {name: "\"\"", value: "", valid: false},
    {name: "\"0\"", value: "0", valid: false},
    {name: "\"true\"", value: "true", valid: false},
    {name: "\"false\"", value: "false", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "new Date()", value: new Date(), valid: false},
    {name: "/regex/", value: /regex/, valid: false},
  ];

  runTests($Boolean, items);


  describe("lte", function () {
    const $Boolean: BooleanType = new BooleanType();

    interface TestItem {
      left: boolean;
      right: boolean;
      expected: boolean;
    }

    const testItems: TestItem[] = [
      {left: false, right: false, expected: true},
      {left: false, right: true, expected: true},
      {left: true, right: false, expected: false},
      {left: true, right: true, expected: true},
    ];

    for (const {left, right, expected} of testItems) {
      it(`.lte(${left}, ${right}) should return ${expected}`, function () {
        chai.assert.strictEqual($Boolean.lte(left, right), expected);
      });
    }
  });
});
