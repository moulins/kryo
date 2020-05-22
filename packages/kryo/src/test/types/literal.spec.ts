import { LiteralType } from "../../lib/literal.js";
import { TsEnumType } from "../../lib/ts-enum.js";
import { Ucs2StringType } from "../../lib/ucs2-string.js";
import { assertKryoType, runTests, TypedValue } from "../helpers/test.js";

describe("Literal", function () {
  describe("Literal<\"foo\">", function () {
    const $Foo = new LiteralType(() => ({
      type: new Ucs2StringType({maxLength: Infinity}),
      value: "foo" as "foo",
    }));

    assertKryoType<typeof $Foo, "foo">(true);

    const items: TypedValue[] = [
      {
        name: "\"foo\"",
        value: "foo",
        valid: true,
        output: {
          bson: Buffer.from("10000000025f0004000000666f6f0000", "hex"),
          json: "\"foo\"",
          qs: "_=foo",
        },
      },

      {name: "\"bar\"", value: "bar", valid: false},
      {name: "0", value: 0, valid: false},
      {name: "1", value: 1, valid: false},
      {name: "\"\"", value: "", valid: false},
      {name: "\"0\"", value: "0", valid: false},
      {name: "\"true\"", value: "true", valid: false},
      {name: "\"false\"", value: "false", valid: false},
      {name: "true", value: true, valid: false},
      {name: "false", value: false, valid: false},
      {name: "Infinity", value: Infinity, valid: false},
      {name: "-Infinity", value: -Infinity, valid: false},
      {
        name: "new Date(\"1247-05-18T19:40:08.418Z\")",
        value: new Date("1247-05-18T19:40:08.418Z"),
        valid: false,
      },
      {name: "NaN", value: NaN, valid: false},
      {name: "undefined", value: undefined, valid: false},
      {name: "null", value: null, valid: false},
      {name: "[]", value: [], valid: false},
      {name: "{}", value: {}, valid: false},
      {name: "/regex/", value: /regex/, valid: false},
    ];

    runTests($Foo, items);
  });

  describe("Literal<Color.Red>", function () {
    enum Color {
      Red,
      Green,
      Blue,
    }

    const $ColorRed = new LiteralType({
      type: new TsEnumType({enum: Color}),
      value: Color.Red as Color.Red,
    });

    assertKryoType<typeof $ColorRed, Color.Red>(true);

    const items: TypedValue[] = [
      {
        name: "Color.Red",
        value: Color.Red,
        valid: true,
        output: {
          bson: Buffer.from("10000000025f00040000005265640000", "hex"),
          json: "\"Red\"",
          qs: "_=Red",
        },
      },
      {
        name: "0",
        value: 0,
        valid: true,
        output: {
          bson: Buffer.from("10000000025f00040000005265640000", "hex"),
          json: "\"Red\"",
          qs: "_=Red",
        },
      },
      {name: "Color.Green", value: Color.Green, valid: false},
      {name: "undefined", value: undefined, valid: false},
    ];

    runTests($ColorRed, items);
  });
});
