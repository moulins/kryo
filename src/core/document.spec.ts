import {DateType} from "./date";
import {IntegerType} from "./integer";
import {DocumentType, DocumentOptions} from "./document";
import {RunTestItem, runTest, runReadWrite} from "./helpers/test";
import * as chai from "chai";
let assert = chai.assert;

interface NumberConstructorES6 extends NumberConstructor{
  MAX_SAFE_INTEGER: number;
  MIN_SAFE_INTEGER: number;
  EPSILON: number;
}

describe("DocumentType", function () {
  
  let options: DocumentOptions = {
    properties: {
      "dateProp": {
        type: new DateType()
      },
      "intProp": {
        type: new IntegerType()
      }
    }
  };

  let type: DocumentType = new DocumentType(options);

  let truthyItems: RunTestItem[] = [
    {name: "{dateProp: new Date(), intProp: 10}", value: {dateProp: new Date(), intProp: 10}, message: null}
  ];

  runTest(type, truthyItems);

  let falsyItems: RunTestItem[] = [
    {name: "{dateProp: new Date(), intProp: [10]}", value: {dateProp: new Date(), intProp: [10]}, message: ""}
  ];

  runTest(type, falsyItems);

  it("#equals({dateProp: new Date(1458408675184), intProp: 10}, {dateProp: new Date(1458408675184), intProp: 10}) should resolve true", function() {
    return type
      .equals({dateProp: new Date(1458408675184), intProp: 10}, {dateProp: new Date(1458408675184), intProp: 10})
      .then((result: boolean) => {
        assert.strictEqual(result, true);
      })
  });

  it("#equals({dateProp: new Date(1458408675184), intProp: 10}, {dateProp: new Date(1458408675184), intProp: 123}) should resolve false", function() {
    return type
      .equals({dateProp: new Date(1458408675184), intProp: 10}, {dateProp: new Date(1458408675184), intProp: 123})
      .then((result: boolean) => {
        assert.strictEqual(result, false);
      })
  });
  
  runReadWrite({
    message: "Simple JSON encoding",
    type: type,
    value: {dateProp: new Date(), intProp: 10},
    format: "json"
  });

});
