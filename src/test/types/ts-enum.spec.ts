import bson from "bson";
import { CaseStyle } from "../../lib/case-style";
import { TsEnumType } from "../../lib/types/ts-enum";
import { runTests, TypedValue } from "../helpers/test";

const bsonSerializer: bson.BSON = new bson.BSON();

describe("TsEnum", function () {
  enum Color {
    Red,
    Green,
    Blue,
  }

  const $Color: TsEnumType<Color> = new TsEnumType({enum: Color});

  const items: TypedValue[] = [
    {
      name: "Color.Red",
      value: Color.Red,
      valid: true,
      output: {
        json: "\"Red\"",
      },
    },
    {
      name: "Color.Green",
      value: Color.Green,
      valid: true,
      output: {
        json: "\"Green\"",
      },
    },
    {
      name: "Color.Blue",
      value: Color.Blue,
      valid: true,
      output: {
        json: "\"Blue\"",
      },
    },
    {
      name: "0",
      value: 0,
      valid: true,
      output: {
        json: "\"Red\"",
      },
    },
    {
      name: "1",
      value: 1,
      valid: true,
      output: {
        json: "\"Green\"",
      },
    },
    {
      name: "2",
      value: 2,
      valid: true,
      output: {
        json: "\"Blue\"",
      },
    },

    {name: "new Date()", value: new Date(), valid: false},
    {name: "3", value: 3, valid: false},
    {name: "-1", value: -1, valid: false},
    {name: "\"\"", value: "", valid: false},
    {name: "\"0\"", value: "0", valid: false},
    {name: "\"true\"", value: "true", valid: false},
    {name: "\"false\"", value: "false", valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false},
  ];

  runTests($Color, items);
});

describe("SimpleEnum: rename KebabCase", function () {
  enum Node {
    Expression,
    BinaryOperator,
    BlockStatement,
  }

  const $Node: TsEnumType<Node> = new TsEnumType(() => ({enum: Node, changeCase: CaseStyle.KebabCase}));

  const items: TypedValue[] = [
    {
      name: "Node.Expression",
      value: Node.Expression,
      valid: true,
      output: {
        bson: bsonSerializer.serialize({_: "expression"}),
        json: "\"expression\"",
        qs: "_=expression",
      },
    },
    {
      name: "Node.BinaryOperator",
      value: Node.BinaryOperator,
      valid: true,
      output: {
        bson: bsonSerializer.serialize({_: "binary-operator"}),
        json: "\"binary-operator\"",
        qs: "_=binary-operator",
      },
    },
    {
      name: "Node.BlockStatement",
      value: Node.BlockStatement,
      valid: true,
      output: {
        bson: bsonSerializer.serialize({_: "block-statement"}),
        json: "\"block-statement\"",
        qs: "_=block-statement",
      },
    },
    {
      name: "0",
      value: 0,
      valid: true,
      output: {
        bson: bsonSerializer.serialize({_: "expression"}),
        json: "\"expression\"",
        qs: "_=expression",
      },
    },
    {
      name: "1",
      value: 1,
      valid: true,
      output: {
        bson: bsonSerializer.serialize({_: "binary-operator"}),
        json: "\"binary-operator\"",
        qs: "_=binary-operator",
      },
    },
    {
      name: "2",
      value: 2,
      valid: true,
      output: {
        bson: bsonSerializer.serialize({_: "block-statement"}),
        json: "\"block-statement\"",
        qs: "_=block-statement",
      },
    },
  ];

  runTests($Node, items);
});
