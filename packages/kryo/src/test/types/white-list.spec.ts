import { Ucs2StringType } from "../../lib/ucs2-string.js";
import { WhiteListType } from "../../lib/white-list.js";
import { assertKryoType, runTests, TypedValue } from "../helpers/test.js";

describe("WhiteListType", function () {
  const $Ucs2String = new Ucs2StringType({maxLength: 10});
  type VarName = "foo" | "bar" | "baz";
  const $VarName = new WhiteListType({
    itemType: $Ucs2String,
    values: ["foo" as "foo", "bar" as "bar", "baz" as "baz"],
  });

  assertKryoType<typeof $VarName, VarName>(true);

  const items: TypedValue[] = [
    {name: "\"foo\"", value: "foo", valid: true},
    {name: "\"bar\"", value: "bar", valid: true},
    {name: "\"baz\"", value: "baz", valid: true},

    {name: "\"quz\"", value: "quz", valid: false},
    {name: "\" foo \"", value: " foo ", valid: false},
    {name: "\"FOO\"", value: "FOO", valid: false},
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
    {name: "/regex/", value: /regex/, valid: false},
  ];

  runTests($VarName, items);
});
