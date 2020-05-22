import { IntegerType } from "../../lib/integer.js";
import { MapType } from "../../lib/map.js";
import { Ucs2StringType } from "../../lib/ucs2-string.js";
import { assertKryoType, runTests, TypedValue } from "../helpers/test.js";

describe("Map", function () {
  const $Map = new MapType({
    keyType: new IntegerType(),
    valueType: new IntegerType(),
    maxSize: 5,
  });

  assertKryoType<typeof $Map, Map<number, number>>(true);

  const items: TypedValue[] = [
    {
      name: "new Map([[1, 100], [2, 200]])",
      value: new Map([[1, 100], [2, 200]]),
      valid: true,
      output: {
        json: "{\"1\":100,\"2\":200}",
        qs: "ignore",
      },
    },

    {name: "new Date(0)", value: new Date(0), valid: false},
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

  runTests($Map, items);
});

describe("Map (assumeStringKey)", function () {
  const $Map = new MapType({
    keyType: new Ucs2StringType({pattern: /^a+$/, maxLength: 10}),
    valueType: new IntegerType(),
    maxSize: 5,
    assumeStringKey: true,
  });

  assertKryoType<typeof $Map, Map<string, number>>(true);

  const items: TypedValue[] = [
    {
      name: "new Map([[a, 100], [aa, 200]])",
      value: new Map([["a", 100], ["aa", 200]]),
      valid: true,
      output: {
        json: "{\"a\":100,\"aa\":200}",
      },
    },
  ];

  runTests($Map, items);
});
