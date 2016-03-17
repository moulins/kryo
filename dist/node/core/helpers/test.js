"use strict";
var chai = require("chai");
var assert = chai.assert;
function runTypeTestSync(type, items) {
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
exports.runTypeTestSync = runTypeTestSync;
