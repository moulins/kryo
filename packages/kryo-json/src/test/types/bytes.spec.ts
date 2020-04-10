import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { BytesType } from "kryo/lib/types/bytes.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("Bytes", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  const shortBuffer: BytesType = new BytesType({
    maxLength: 2,
  });

  const items: TestItem[] = [
    {
      name: "Uint8Array.from([])",
      value: Uint8Array.from([]),
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "\"\""},
      ],
    },
    {
      name: "Uint8Array.from([1])",
      value: Uint8Array.from([1]),
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "\"01\""},
      ],
    },
    {
      name: "Uint8Array.from([2, 3])",
      value: Uint8Array.from([2, 3]),
      io: [
        {writer: JSON_WRITER, reader: JSON_READER, raw: "\"0203\""},
      ],
    },
  ];

  registerMochaSuites(shortBuffer, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "\"040506\"",
      "[7]",
      "[0.5]",
      "[null]",
      "[]",
      "[0]",
      "[0, 0]",
      "\"1970-01-01T00:00:00.000Z\"",
      "0",
      "1",
      "",
      "\"0\"",
      "\"true\"",
      "\"false\"",
      "null",
      "{}",
    ];
    registerErrMochaTests(JSON_READER, shortBuffer, invalids);
  });
});
