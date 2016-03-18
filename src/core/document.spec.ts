import {DateType} from "./date";
import {IntegerType} from "./integer";
import {DocumentType, DocumentOptions} from "./document";
import {TypeSync} from "via-core";
import {TypeTestItem, runTypeTest} from "./helpers/test";

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

  let truthyItems: TypeTestItem[] = [
    {name: "{dateProp: new Date(), intProp: 10}", value: {dateProp: new Date(), intProp: 10}, message: null},
  ];

  runTypeTest(type, truthyItems);

});
