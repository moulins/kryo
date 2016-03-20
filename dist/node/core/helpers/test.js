"use strict";
var chai = require("chai");
var assert = chai.assert;
function runTestSync(type, items) {
    var _loop_1 = function(item) {
        if (!("name" in item)) {
            item.name = String(item.value);
        }
        it("#testSync should match correctly for: " + item.name, function () {
            try {
                var result = type.testSync(item.value);
                if (item.message === null) {
                    assert.strictEqual(result, null);
                }
                else {
                    assert.instanceOf(result, Error);
                    if (item.message === "") {
                    }
                    else {
                        assert.strictEqual(result.message, item.message);
                    }
                }
            }
            catch (err) {
                throw err;
            }
        });
    };
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        _loop_1(item);
    }
}
exports.runTestSync = runTestSync;
function runTest(type, items) {
    var _loop_2 = function(item) {
        if (!("name" in item)) {
            item.name = String(item.value);
        }
        it("#test should match correctly for: " + item.name, function () {
            return type
                .test(item.value)
                .then(function (result) {
                if (item.message === null) {
                    assert.strictEqual(result, null);
                }
                else {
                    assert.instanceOf(result, Error);
                    if (item.message === "") {
                    }
                    else {
                        assert.strictEqual(result.message, item.message);
                    }
                }
            });
        });
    };
    for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
        var item = items_2[_i];
        _loop_2(item);
    }
}
exports.runTest = runTest;
function runReadWrite(options) {
    it("#write #read #equals: " + options.message, function () {
        return options.type
            .write(options.format, options.value)
            .then(function (raw) {
            var jsonClone = JSON.parse(JSON.stringify(raw));
            return options.type
                .read(options.format, jsonClone);
        })
            .then(function (result) {
            return options.type
                .equals(result, options.value);
        })
            .then(function (equals) {
            assert.strictEqual(equals, true);
        });
    });
}
exports.runReadWrite = runReadWrite;
