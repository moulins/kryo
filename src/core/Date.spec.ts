import {DateTypeSync, DateType} from "./Date";
import {TypeSync} from "./interfaces/Type";
import {TypeTestItem, runTypeTestSync} from "./tests-helpers/test";

interface NumberConstructorES6 extends NumberConstructor{
  MAX_SAFE_INTEGER: number,
  MIN_SAFE_INTEGER: number,
  EPSILON: number
}

describe("DateType", function () {

  let type: DateTypeSync = new DateTypeSync();

  let truthyItems: TypeTestItem[] = [
    {name: "new Date()", value: new Date(), message: null},
    {name: "new Date(0)", value: new Date(0), message: null},
    {name: 'new Date("1247-05-18T19:40:08.418Z")', value: new Date("1247-05-18T19:40:08.418Z"), message: null},
    {name: "new Date(Number.EPSILON)", value: new Date((<NumberConstructorES6>Number).EPSILON), message: null},
    {name: "new Date(Math.PI)", value: new Date(Math.PI), message: null}
  ];

  runTypeTestSync(type, truthyItems);

  let falsyItems: TypeTestItem[] = [
    {name: "new Date(Number.MAX_SAFE_INTEGER)", value: new Date((<NumberConstructorES6>Number).MAX_SAFE_INTEGER), message: ""},
    {name: "new Date(Number.MIN_SAFE_INTEGER)", value: new Date((<NumberConstructorES6>Number).MIN_SAFE_INTEGER), message: ""},
    {name: "new Date(Number.MAX_VALUE)", value: new Date(Number.MAX_VALUE), message: ""},
    {name: "new Date(NaN)", value: new Date(NaN), message: ""},
    {name: "1", value: 1, message: ""},
    {name: "0.5", value: 0.5, message: ""},
    {name: "Infinity", value: Infinity, message: ""},
    {name: "NaN", value: NaN, message: ""},
    {name: "undefined", value: undefined, message: ""},
    {name: "Infinity", value: Infinity, message: ""},
    {name: "null", value: null, message: ""},
    {name: '"1"', value: "1", message: ""},
    {name: "[]", value: [], message: ""},
    {name: "{}", value: {}, message: ""},
    {name: "/regex/", value: /regex/, message: ""}
  ];

  runTypeTestSync(type, falsyItems);

});
