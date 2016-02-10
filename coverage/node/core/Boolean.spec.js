"use strict";
var Boolean_1 = require("./Boolean");
var chai = require("chai");
var assert = chai.assert;
describe("BooleanType", function () {
    var validValues = [
        true,
        false
    ];
    var invalidValues = [
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
    it("#test should return true if the argument is a boolean", function () {
        var type = new Boolean_1.BooleanType();
        for (var i = 0, l = validValues.length; i < l; i++) {
            assert.strictEqual(type.testSync(validValues[i]), true, String(validValues[i]));
        }
    });
    it("#test should return false if the argument is not a boolean", function () {
        var type = new Boolean_1.BooleanType();
        for (var i = 0, l = invalidValues.length; i < l; i++) {
            assert.notStrictEqual(type.testSync(invalidValues[i]), true, String(invalidValues[i]));
        }
    });
});
