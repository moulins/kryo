import {BooleanType} from "./boolean";
import {assert} from "chai";

describe("BooleanType", function(){

  let validValues = [
    true,
    false
  ];

  let invalidValues = [
    new Boolean(true),
    new Boolean(false),
    0,
    1,
    "",
    "0",
    "false",
    "true",
    [],
    {},
    new Date(),
    /regex/
  ];

  it("#test should return true if the argument is a boolean", function() {
    let type = new BooleanType();
    for (let i = 0, l = validValues.length; i < l; i++) {
      assert.strictEqual(type.testSync(validValues[i]), null, String(validValues[i]));
    }
  });

  it("#test should return false if the argument is not a boolean", function() {
    let type = new BooleanType();
    for (let i = 0, l = invalidValues.length; i < l; i++) {
      assert.notStrictEqual(type.testSync(invalidValues[i]), null, String(invalidValues[i]));
    }
  });

});
