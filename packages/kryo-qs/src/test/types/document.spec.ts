import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { CaseStyle } from "kryo/lib/case-style.js";
import { DateType } from "kryo/lib/types/date.js";
import { DocumentIoType, DocumentType } from "kryo/lib/types/document.js";
import { IntegerType } from "kryo/lib/types/integer.js";

import { QsReader } from "../../lib/qs-reader.js";
import { QsWriter } from "../../lib/qs-writer.js";

describe("Document", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

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
        {writer: QS_WRITER, reader: QS_READER, raw: "dateProp=1970-01-01T00%3A00%3A00.000Z&optIntProp=50&nestedDoc%5Bid%5D=10"},
        {reader: QS_READER, raw: "dateProp=1970-01-01T00%3A00%3A00.000Z&optIntProp=50&nestedDoc[id]=10"},
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
        {writer: QS_WRITER, reader: QS_READER, raw: "dateProp=1970-01-01T00%3A00%3A00.000Z&nestedDoc%5Bid%5D=10"},
        {reader: QS_READER, raw: "dateProp=1970-01-01T00%3A00%3A00.000Z&nestedDoc[id]=10"},
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
    registerErrMochaTests(QS_READER, documentType, invalids);
  });
});

describe("Document: rename", function () {
  const QS_READER: QsReader = new QsReader();
  const QS_WRITER: QsWriter = new QsWriter();

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
          writer: QS_WRITER,
          reader: QS_READER,
          raw: "xmin=0&X_MAX=10&__yMin=20&y-max=30",
        },
      ],
    },
  ];

  registerMochaSuites(type, items);
});