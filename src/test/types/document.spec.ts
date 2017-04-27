import {DateType} from "../../lib/types/date";
import {DocumentType} from "../../lib/types/document";
import {Int32Type} from "../../lib/types/int32";
import {runTests, TypedValue} from "../helpers/test";

describe("DocumentType", function () {
  const documentType: DocumentType<any> = new DocumentType({
    ignoreExtraKeys: true,
    properties: {
      dateProp: {
        optional: false,
        type: new DateType()
      },
      optIntProp: {
        optional: true,
        type: new Int32Type({})
      },
      nestedDoc: {
        optional: true,
        type: new DocumentType({
          ignoreExtraKeys: true,
          properties: {
            id: {
              optional: true,
              type: new Int32Type({})
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
        json: {canonical: {dateProp: "1970-01-01T00:00:00.000Z", optIntProp: 50, nestedDoc: {id: 10}}}
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
