"use strict";
var promisify_1 = require("./helpers/promisify");
var BooleanTypeSync = (function () {
    function BooleanTypeSync() {
        this.isSync = true;
        this.name = "boolean";
    }
    BooleanTypeSync.prototype.readSync = function (format, val) {
        return Boolean(val);
    };
    BooleanTypeSync.prototype.writeSync = function (format, val) {
        return Boolean(val);
    };
    BooleanTypeSync.prototype.testSync = function (val) {
        if (typeof val !== "boolean") {
            return new Error('Expected typeof val to be "boolean"');
        }
        return null;
    };
    BooleanTypeSync.prototype.normalizeSync = function (val) {
        return Boolean(val);
    };
    BooleanTypeSync.prototype.equalsSync = function (val1, val2) {
        return val1 === val2;
    };
    BooleanTypeSync.prototype.cloneSync = function (val) {
        return val;
    };
    BooleanTypeSync.prototype.diffSync = function (oldVal, newVal) {
        return oldVal !== newVal;
    };
    BooleanTypeSync.prototype.patchSync = function (oldVal, diff) {
        return diff ? !oldVal : oldVal;
    };
    BooleanTypeSync.prototype.revertSync = function (newVal, diff) {
        return diff ? !newVal : newVal;
    };
    return BooleanTypeSync;
}());
exports.BooleanTypeSync = BooleanTypeSync;
exports.BooleanType = promisify_1.promisifyClass(BooleanTypeSync);
