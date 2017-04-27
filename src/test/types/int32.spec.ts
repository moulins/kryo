import {Int32Type} from "../../lib/types/int32";
import {runTests, TypedValue} from "../helpers/test";

describe("IntegerType", function () {
  const type: Int32Type = new Int32Type({});

  const items: TypedValue[] = [
    // Valid values
    {name: "0", value: 0, valid: true},
    {name: "1", value: 1, valid: true},
    {name: "-1", value: -1, valid: true},
    {name: "2", value: 2, valid: true},
    {name: "1e3", value: 1e3, valid: true},
    {name: "-1e3", value: 1e3, valid: true},
    // Invalid values
    {name: "0.5", value: 0.5, valid: false},
    {name: "0.0001", value: 0.0001, valid: false},
    {name: "Number.EPSILON", value: Number.EPSILON, valid: false},
    {name: "Number.MAX_SAFE_INTEGER", value: Number.MAX_SAFE_INTEGER, valid: false},
    {name: "Number.MIN_SAFE_INTEGER", value: Number.MIN_SAFE_INTEGER, valid: false},
    {name: "Number.MAX_VALUE", value: Number.MAX_VALUE, valid: false},
    {name: "new Number(true)", value: new Number(1), valid: false},
    {name: '""', value: "", valid: false},
    {name: '"0"', value: "0", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: '"true"', value: "true", valid: false},
    {name: '"false"', value: "false", valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "new Date()", value: new Date(), valid: false},
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(type, items);
});
