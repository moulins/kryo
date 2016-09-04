import {DateType} from "./date";
import {TypedValue, runTests} from "./helpers/test";

interface NumberConstructorES6 extends NumberConstructor{
  MAX_SAFE_INTEGER: number;
  MIN_SAFE_INTEGER: number;
  EPSILON: number;
}

describe("DateType", function () {

  let type: DateType = new DateType();

  let items: TypedValue[] = [
    {name: "new Date()", value: new Date(), valid: true},
    {
      name: "new Date(0)",
      value: new Date(0),
      valid: true,
      serialized: {
        "json-doc": {
          canonical: "1970-01-01T00:00:00.000Z",
          values: [
            {value: 0, valid: true},
            {value: null, valid: false},
          ]
        }
      }
    },
    {name: 'new Date("1247-05-18T19:40:08.418Z")', value: new Date("1247-05-18T19:40:08.418Z"), valid: true},
    {name: "new Date(Number.EPSILON)", value: new Date((<NumberConstructorES6> Number).EPSILON), valid: true},
    {name: "new Date(Math.PI)", value: new Date(Math.PI), valid: true},

    {name: "new Date(Number.MAX_SAFE_INTEGER)", value: new Date((<NumberConstructorES6> Number).MAX_SAFE_INTEGER), valid: false},
    {name: "new Date(Number.MIN_SAFE_INTEGER)", value: new Date((<NumberConstructorES6> Number).MIN_SAFE_INTEGER), valid: false},
    {name: "new Date(Number.MAX_VALUE)", value: new Date(Number.MAX_VALUE), valid: false},
    {name: "new Date(NaN)", value: new Date(NaN), valid: false},
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
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(type, items);
});
