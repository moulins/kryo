import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { BooleanType } from "kryo/lib/boolean.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("kryo-json | Boolean", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  const type: BooleanType = new BooleanType();

  const items: TestItem[] = [
    {name: "true", value: true, io: [{writer: JSON_WRITER, reader: JSON_READER, raw: "true"}]},
    {name: "false", value: false, io: [{writer: JSON_WRITER, reader: JSON_READER, raw: "false"}]},
  ];

  registerMochaSuites(type, items);

  describe("Reader", function () {
    const invalids: string[] = [
      "1",
      "\"on\"",
      "\"true\"",
    ];
    registerErrMochaTests(JSON_READER, type, invalids);
  });
});
