import {IntegerTypeSync, IntegerType} from "./integer";
import {TypeSync} from "via-core";
import {RunTestItem, runTestSync} from "./helpers/test";

interface NumberConstructorES6 extends NumberConstructor{
  MAX_SAFE_INTEGER: number;
  MIN_SAFE_INTEGER: number;
  EPSILON: number;
}

describe("NumberType", function () {

  let type: IntegerTypeSync = new IntegerTypeSync();

  let truthyItems: RunTestItem[] = [
    {value: 0, message: null},
    {value: 1, message: null},
    {value: -1, message: null},
    {value: 2, message: null},
    {value: 1e3, message: null},
    {value: -1e3, message: null},
    {value: (<NumberConstructorES6> Number).MAX_SAFE_INTEGER, message: null},
    {value: (<NumberConstructorES6> Number).MIN_SAFE_INTEGER, message: null},
    {value: Number.MAX_VALUE, message: null}
  ];

  runTestSync(type, truthyItems);

  let falsyItems: RunTestItem[] = [
    {name: "new Number(1)", value: new Number(1), message: ""},
    {name: "0.5", value: 0.5, message: ""},
    {name: "0.0001", value: 0.0001, message: ""},
    {name: "Infinity", value: Infinity, message: ""},
    {name: "-Infinity", value: -Infinity, message: ""},
    {name: "NaN", value: NaN, message: ""},
    {name: "undefined", value: undefined, message: ""},
    {name: "null", value: null, message: ""},
    {name: "Number.EPSILON", value: (<NumberConstructorES6> Number).EPSILON, message: ""},
    {name: '"0"', value: "0", message: ""},
    {name: "[]", value: [], message: ""},
    {name: "{}", value: {}, message: ""},
    {name: "/regex/", value: /regex/, message: ""}
  ];

  runTestSync(type, falsyItems);

});
