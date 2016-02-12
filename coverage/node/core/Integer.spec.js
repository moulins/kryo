"use strict";
var Integer_1 = require("./Integer");
var chai = require("chai");
var assert = chai.assert;
describe("IntegerType", function () {
    var validValues = [
        0,
        1,
        -1,
        2,
        -2,
        1e3,
        -1e3,
        Number.MAX_SAFE_INTEGER,
        -Number.MAX_SAFE_INTEGER,
        Number.MAX_VALUE
    ];
    var invalidValues = [
        new Number(1),
        0.5,
        0.0001,
        Infinity,
        -Infinity,
        NaN,
        undefined,
        null,
        Number.EPSILON,
        '0',
        [],
        {},
        new Date(),
        /regex/
    ];
    it("#test should return true if the argument is an integer", function () {
        var type = new Integer_1.IntegerType();
        for (var i = 0, l = validValues.length; i < l; i++) {
            assert.strictEqual(type.testSync(validValues[i]), true, String(validValues[i]));
        }
    });
    it("#test should return false if the argument is not an integer", function () {
        var type = new Integer_1.IntegerType();
        for (var i = 0, l = invalidValues.length; i < l; i++) {
            assert.notStrictEqual(type.testSync(invalidValues[i]), true, String(invalidValues[i]));
        }
    });
});
