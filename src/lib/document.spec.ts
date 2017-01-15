import {runTests, TypedValue} from "../test/test";
import {DateType} from "./date";
import {DocumentType} from "./document";
import {IntegerType} from "./integer";

describe("DocumentType", function () {
  const documentType: DocumentType = new DocumentType({
    properties: {
      dateProp: {
        type: new DateType()
      },
      optIntProp: {
        optional: true,
        type: new IntegerType()
      },
      nestedDoc: {
        nullable: true,
        type: new DocumentType({
          properties: {
            id: {
              optional: true,
              nullable: true,
              type: new IntegerType()
            }
          }
        })
      }
    }
  });

  const items: TypedValue[] = [
    {
      value: {
        dateProp: new Date(0),
        optIntProp: 50,
        nestedDoc: {
          id: 10
        }
      },
      valid: true,
      serialized: {
        "json-doc": {canonical: {dateProp: "1970-01-01T00:00:00.000Z", optIntProp: 50, nestedDoc: {id: 10}}}
      }
    },

    {name: "new Date(0)", value: new Date(0), valid: false},
    {name: "0", value: 0, valid: false},
    {name: "1", value: 1, valid: false},
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

  runTests(documentType, items);
});
