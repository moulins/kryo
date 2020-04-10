import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { CaseStyle } from "kryo/lib/case-style.js";
import { DocumentType } from "kryo/lib/types/document.js";
import { IntegerType } from "kryo/lib/types/integer.js";
import { TryUnionType } from "kryo/lib/types/try-union.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("TryUnion", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  describe("Shape", function () {
    interface Rectangle {
      width: number;
      height: number;
    }

    const $Rectangle: DocumentType<Rectangle> = new DocumentType<Rectangle>({
      properties: {
        width: {type: new IntegerType()},
        height: {type: new IntegerType()},
      },
      changeCase: CaseStyle.KebabCase,
    });

    interface Circle {
      radius: number;
    }

    const $Circle: DocumentType<Circle> = new DocumentType<Circle>({
      properties: {
        radius: {type: new IntegerType()},
      },
      changeCase: CaseStyle.KebabCase,
    });

    type Shape = Rectangle | Circle;
    const $Shape: TryUnionType<Shape> = new TryUnionType<Shape>({
      variants: [$Rectangle, $Circle],
    });

    const items: TestItem[] = [
      {
        name: "Rectangle {width: 10, height: 20}",
        value: {
          width: 10,
          height: 20,
        },
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"width\":10,\"height\":20}"},
        ],
      },
      {
        name: "Circle {radius: 15}",
        value: {
          radius: 15,
        },
        io: [
          {writer: JSON_WRITER, reader: JSON_READER, raw: "{\"radius\":15}"},
        ],
      },
    ];

    registerMochaSuites($Shape, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "{\"type\":\"circle\"}",
        "{\"type\":\"circle\",\"radius\":true}",
        "null",
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
      registerErrMochaTests(JSON_READER, $Shape, invalids);
    });
  });
});
