import {BooleanType} from "./boolean";
import {TestItem, runTests} from "./helpers/test";

describe("BooleanType", function () {

  let type: BooleanType = new BooleanType();

  let items: TestItem[] = [
    {name: "true", value: true, valid: true},
    {name: "false", value: false, valid: true},

    {name: 'new Boolean(true)', value: new Boolean(true), valid: false},
    {name: 'new Boolean(false)', value: new Boolean(false), valid: false},
    {name: "0", value: 0, valid: false},
    {name: "1", value: 1, valid: false},
    {name: '""', value: "", valid: false},
    {name: '"0"', value: "0", valid: false},
    {name: '"true"', value: "true", valid: false},
    {name: '"false"', value: "false", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "new Date()", value: new Date(), valid: false},
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(type, items);
});
