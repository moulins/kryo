import { AnyType } from "../../lib/any.js";
import { assertKryoType, runTests, TypedValue } from "../helpers/test.js";

describe("Any", function () {
  const $Any = new AnyType();
  assertKryoType<typeof $Any, any>(true);

  const items: TypedValue[] = [
    {name: "true", value: true, valid: true},
    {name: "false", value: false, valid: true},
    {name: "0", value: 0, valid: true},
    {name: "1", value: 1, valid: true},
    {name: "\"\"", value: "", valid: true},
    {name: "\"0\"", value: "0", valid: true},
    {name: "\"true\"", value: "true", valid: true},
    {name: "\"false\"", value: "false", valid: true},
    {name: "Infinity", value: Infinity, valid: true},
    {name: "-Infinity", value: -Infinity, valid: true},
    {name: "NaN", value: NaN, valid: true},
    // {name: "undefined", value: undefined, valid: true},
    {name: "null", value: null, valid: true},
    {name: "[]", value: [], valid: true},
    {name: "{}", value: {}, valid: true},
    {name: "new Date()", value: new Date(), valid: true},
    {name: "/regex/", value: /regex/, valid: true},
  ];

  runTests($Any, items);

});
