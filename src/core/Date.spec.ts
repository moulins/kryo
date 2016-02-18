import {DateType} from "./Date";
import * as chai from "chai";
import {TypeSync} from "./interfaces/Type";

let assert = chai.assert;

interface NumberConstructorES6 extends NumberConstructor{
  MAX_SAFE_INTEGER: number,
  MIN_SAFE_INTEGER: number,
  EPSILON: number
}

describe("DateType", function () {

  let validValues = [
    new Date(),
    new Date(0),
    new Date("1247-05-18T19:40:08.418Z"),
    new Date((<NumberConstructorES6>Number).EPSILON),
    new Date(Math.PI)
  ];

  let invalidValues = [
    new Date((<NumberConstructorES6>Number).MAX_SAFE_INTEGER),
    new Date((<NumberConstructorES6>Number).MIN_SAFE_INTEGER),
    new Date(Number.MAX_VALUE),
    new Date(NaN),
    1,
    0.5,
    Infinity,
    NaN,
    undefined,
    null,
    '1',
    [],
    {},
    /regex/
  ];

  it("#test should return true if the argument is a date", function () {
    let type:TypeSync = new DateType();
    for (let i = 0, l = validValues.length; i < l; i++) {
      console.log(String(validValues[i]));
      assert.strictEqual(type.testSync(validValues[i]), true, String(validValues[i]));
    }
  });

  it("#test should return false if the argument is not a date", function () {
    let type:TypeSync = new DateType();
    for (let i = 0, l = invalidValues.length; i < l; i++) {
      assert.notStrictEqual(type.testSync(invalidValues[i]), true, String(invalidValues[i]));
    }
  });

});
