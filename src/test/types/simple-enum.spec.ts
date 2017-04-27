import {SimpleEnumType} from "../../lib/types/simple-enum";
import {runTests, TypedValue} from "../helpers/test";

describe("SimpleEnum", function () {
  enum Color {
    Red,
    Green,
    Blue
  }

  const type: SimpleEnumType<Color> = new SimpleEnumType(Color);

  const items: TypedValue[] = [
    {
      name: "Color.Red",
      value: Color.Red,
      valid: true,
      serialized: {
        json: {canonical: "Red"}
      }
    },
    {
      name: "Color.Green",
      value: Color.Green,
      valid: true,
      serialized: {
        json: {canonical: "Green"}
      }
    },
    {
      name: "Color.Blue",
      value: Color.Blue,
      valid: true,
      serialized: {
        json: {canonical: "Blue"}
      }
    },
    {
      name: "0",
      value: 0,
      valid: true,
      serialized: {
        json: {canonical: "Red"}
      }
    },
    {
      name: "1",
      value: 1,
      valid: true,
      serialized: {
        json: {canonical: "Green"}
      }
    },
    {
      name: "2",
      value: 2,
      valid: true,
      serialized: {
        json: {canonical: "Blue"}
      }
    },

    {name: "new Date()", value: new Date(), valid: false},
    {name: "3", value: 3, valid: false},
    {name: "-1", value: -1, valid: false},
    {name: '""', value: "", valid: false},
    {name: '"0"', value: "0", valid: false},
    {name: '"true"', value: "true", valid: false},
    {name: '"false"', value: "false", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false}
  ];

  runTests(type, items);
});
