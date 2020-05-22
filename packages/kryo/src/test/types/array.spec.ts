import { ArrayType } from "../../lib/array.js";
import { $Uint8, IntegerType } from "../../lib/integer.js";
import { assertKryoType, runTests, TypedValue } from "../helpers/test.js";

describe("ArrayType", function () {
  describe("General", function () {
    const $IntArray = new ArrayType({
      itemType: new IntegerType(),
      maxLength: 2,
    });

    assertKryoType<typeof $IntArray, Array<number>>(true);

    const items: TypedValue[] = [
      {
        value: [],
        valid: true,
        output: {
          json: "[]",
        },
      },
      {
        value: [1],
        valid: true,
        output: {
          json: "[1]",
        },
      },
      {
        value: [2, 3],
        valid: true,
        output: {
          json: "[2,3]",
        },
      },
      {
        value: [4, 5, 6],
        valid: false,
      },
      {
        value: [0.5],
        valid: false,
      },
      {
        name: "[null]",
        value: [null],
        valid: false,
      },
      {
        name: "[undefined]",
        value: [undefined],
        valid: false,
      },
      {
        name: "new Array()",
        value: new Array(),
        valid: true,
      },
      {
        name: "new Array(0)",
        value: new Array(0),
        valid: true,
      },
      {
        name: "new Array(1)",
        value: new Array(1),
        valid: false,
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
      {name: "{}", value: {}, valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests($IntArray, items);
  });

  describe("Min/max length", function () {
    const $IntArray: ArrayType<number> = new ArrayType({
      itemType: $Uint8,
      minLength: 2,
      maxLength: 4,
    });

    const items: TypedValue[] = [
      {
        value: [],
        valid: false,
      },
      {
        value: [0],
        valid: false,
      },
      {
        value: [0, 1],
        valid: true,
        output: {
          json: "[0,1]",
        },
      },
      {
        value: [0, 1, 2],
        valid: true,
        output: {
          json: "[0,1,2]",
        },
      },
      {
        value: [0, 1, 2, 3],
        valid: true,
        output: {
          json: "[0,1,2,3]",
        },
      },
      {
        value: [0, 1, 2, 3, 4],
        valid: false,
      },
    ];

    runTests($IntArray, items);
  });
});
