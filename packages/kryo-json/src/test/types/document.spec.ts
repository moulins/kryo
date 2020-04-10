import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { CaseStyle } from "kryo/lib/case-style.js";
import { DateType } from "kryo/lib/types/date.js";
import { DocumentIoType, DocumentType } from "kryo/lib/types/document.js";
import { IntegerType } from "kryo/lib/types/integer.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("Document", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  const documentType: DocumentIoType<any> = new DocumentType({
    noExtraKeys: false,
    properties: {
      dateProp: {
        optional: false,
        type: new DateType(),
      },
      optIntProp: {
        optional: true,
        type: new IntegerType(),
      },
      nestedDoc: {
        optional: true,
        type: new DocumentType({
          noExtraKeys: false,
          properties: {
            id: {
              optional: true,
              type: new IntegerType(),
            },
          },
        }),
      },
    },
  });

  const items: TestItem[] = [
    {
      value: {
        dateProp: new Date(0),
        optIntProp: 50,
        nestedDoc: {
          id: 10,
        },
      },
      io: [
        {
          writer: JSON_WRITER, reader: JSON_READER, raw: JSON.stringify({
            dateProp: "1970-01-01T00:00:00.000Z",
            optIntProp: 50,
            nestedDoc: {id: 10},
          }),
        },
      ],
    },
    {
      value: {
        dateProp: new Date(0),
        nestedDoc: {
          id: 10,
        },
      },
      io: [
        {
          writer: JSON_WRITER,
          reader: JSON_READER,
          raw: JSON.stringify({dateProp: "1970-01-01T00:00:00.000Z", nestedDoc: {id: 10}}),
        },
      ],
    },
  ];

  registerMochaSuites(documentType, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "\"1970-01-01T00:00:00.000Z\"",
      "null",
      "0",
      "1",
      "\"\"",
      "\"0\"",
      "\"true\"",
      "\"false\"",
      "true",
      "false",
      "[]",
      "{}",
    ];
    registerErrMochaTests(JSON_READER, documentType, invalids);
  });
});

describe("Document: rename", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  interface Rect {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }

  const type: DocumentIoType<Rect> = new DocumentType<Rect>({
    properties: {
      xMin: {type: new IntegerType()},
      xMax: {type: new IntegerType(), changeCase: CaseStyle.ScreamingSnakeCase},
      yMin: {type: new IntegerType(), rename: "__yMin"},
      yMax: {type: new IntegerType()},
    },
    rename: {xMin: "xmin"},
    changeCase: CaseStyle.KebabCase,
  });

  const items: TestItem[] = [
    {
      name: "Rect {xMin: 0, xMax: 10, yMin: 20, yMax: 30}",
      value: {
        xMin: 0,
        xMax: 10,
        yMin: 20,
        yMax: 30,
      },
      io: [
        {
          writer: JSON_WRITER,
          reader: JSON_READER,
          raw: JSON.stringify({"xmin": 0, "X_MAX": 10, "__yMin": 20, "y-max": 30}),
        },
      ],
    },
  ];

  registerMochaSuites(type, items);
});
