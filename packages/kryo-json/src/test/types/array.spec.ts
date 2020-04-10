import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { $Boolean } from "kryo/lib/builtins/boolean.js";
import { $Uint8 } from "kryo/lib/builtins/uint8.js";
import { ArrayIoType, ArrayType } from "kryo/lib/types/array.js";
import { IntegerType } from "kryo/lib/types/integer.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("Array", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  describe("Main", function () {
    const $IntArray: ArrayIoType<number> = new ArrayType({
      itemType: new IntegerType(),
      maxLength: 2,
    });

    const items: TestItem[] = [
      {
        value: [],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[]"},
        ],
      },
      {
        value: [1],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[1]"},
        ],
      },
      {
        value: [2, 3],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[2,3]"},
        ],
      },
    ];

    registerMochaSuites($IntArray, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "[4,5,6]",
        "[0.5]",
        "[null]",
        "[undefined]",
        "[]",
        "true",
        "false",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740991",
        "-9007199254740991",
        "\"\"",
        "\"0\"",
        "\"1\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"undefined\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(JSON_READER, $IntArray, invalids);
    });
  });

  describe("Min/Max length", function () {
    const $IntArray: ArrayIoType<number> = new ArrayType({
      itemType: $Uint8,
      minLength: 2,
      maxLength: 4,
    });

    const items: TestItem[] = [
      {
        value: [0, 1],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[0,1]"},
        ],
      },
      {
        value: [0, 1, 2],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[0,1,2]"},
        ],
      },
      {
        value: [0, 1, 2, 3],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[0,1,2,3]"},
        ],
      },
    ];

    registerMochaSuites($IntArray, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "[0.5]",
        "[null]",
        "[undefined]",
        "[]",
        "[0]",
        "[0,1,2,3,4]",
        "true",
        "false",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740991",
        "-9007199254740991",
        "\"\"",
        "\"0\"",
        "\"1\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"undefined\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(JSON_READER, $IntArray, invalids);
    });
  });

  describe("Nested array", function () {
    const $NestedBooleanArray: ArrayIoType<boolean[]> = new ArrayType({
      itemType: new ArrayType({
        itemType: $Boolean,
        maxLength: Infinity,
      }),
      maxLength: Infinity,
    });

    const items: TestItem[] = [
      {
        value: [],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[]"},
        ],
      },
      {
        value: [[]],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[[]]"},
        ],
      },
      {
        value: [[true], [false, true]],
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "[[true],[false,true]]"},
        ],
      },
    ];

    registerMochaSuites($NestedBooleanArray, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "[0.5]",
        "[null]",
        "[undefined]",
        "[]",
        "[[[]]]",
        "[0]",
        "[0,1,2,3,4]",
        "true",
        "false",
        "",
        "0",
        "1",
        "0.5",
        "0.0001",
        "2.220446049250313e-16",
        "9007199254740991",
        "-9007199254740991",
        "\"\"",
        "\"0\"",
        "\"1\"",
        "\"null\"",
        "\"true\"",
        "\"false\"",
        "\"undefined\"",
        "\"NaN\"",
        "\"Infinity\"",
        "\"-Infinity\"",
        "\"foo\"",
        "[]",
        "{}",
        "\"1970-01-01T00:00:00.000Z\"",
      ];
      registerErrMochaTests(JSON_READER, $NestedBooleanArray, invalids);
    });
  });
});
