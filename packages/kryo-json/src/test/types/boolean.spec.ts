import { registerErrMochaTests, registerMochaSuites, TestItem } from "kryo-testing";
import { $Boolean } from "kryo/lib/boolean.js";

import { JsonReader } from "../../lib/json-reader.js";
import { JsonWriter } from "../../lib/json-writer.js";

describe("kryo-json | Boolean", function () {
  const JSON_READER: JsonReader = new JsonReader();
  const JSON_WRITER: JsonWriter = new JsonWriter();

  describe("Default", function () {
    const items: TestItem[] = [
      {name: "true", value: true, io: [{writer: JSON_WRITER, reader: JSON_READER, raw: "true"}]},
      {name: "false", value: false, io: [{writer: JSON_WRITER, reader: JSON_READER, raw: "false"}]},
    ];

    registerMochaSuites($Boolean, items);

    describe("Reader", function () {
      const invalids: string[] = [
        "1",
        "\"on\"",
        "\"true\"",
      ];
      registerErrMochaTests(JSON_READER, $Boolean, invalids);
    });
  });
});
