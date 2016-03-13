import {IntegerType} from "./Integer";
import * as chai from "chai";
import {TypeSync} from "./interfaces/Type";

let assert = chai.assert;

interface NumberConstructorES6 extends NumberConstructor{
  MAX_SAFE_INTEGER: number,
  MIN_SAFE_INTEGER: number,
  EPSILON: number
}

describe("IntegerType", function () {

  let validValues = [
    0,
    1,
    -1,
    2,
    -2,
    1e3,
    -1e3,
    (<NumberConstructorES6>Number).MAX_SAFE_INTEGER,
    (<NumberConstructorES6>Number).MIN_SAFE_INTEGER,
    Number.MAX_VALUE
  ];

  let invalidValues = [
    new Number(1),
    0.5,
    0.0001,
    Infinity,
    -Infinity,
    NaN,
    undefined,
    null,
    (<NumberConstructorES6>Number).EPSILON,
    '0',
    [],
    {},
    new Date(),
    /regex/
  ];

  it("#test should return true if the argument is an integer", function () {
    let type:IntegerType = new IntegerType();
    for (let i = 0, l = validValues.length; i < l; i++) {
      assert.strictEqual(type.testSync(validValues[i]), null, String(validValues[i]));
    }
  });

  it("#test should return false if the argument is not an integer", function () {
    let type:IntegerType = new IntegerType();
    for (let i = 0, l = invalidValues.length; i < l; i++) {
      assert.notStrictEqual(type.testSync(invalidValues[i]), null, String(invalidValues[i]));
    }
  });

});
