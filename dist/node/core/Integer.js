"use strict";
var type_1 = require("./interfaces/type");
var IntegerTypeSync = (function () {
    function IntegerTypeSync() {
        this.isSync = true;
        this.name = "boolean";
    }
    IntegerTypeSync.prototype.readSync = function (format, val) {
        return val;
    };
    IntegerTypeSync.prototype.writeSync = function (format, val) {
        return val;
    };
    IntegerTypeSync.prototype.testSync = function (val) {
        return typeof val === "number" && isFinite(val) && Math.floor(val) === val ? null : new Error("Not an integer");
    };
    IntegerTypeSync.prototype.normalizeSync = function (val) {
        return Math.floor(val);
    };
    IntegerTypeSync.prototype.equalsSync = function (val1, val2) {
        return val1 === val2;
    };
    IntegerTypeSync.prototype.cloneSync = function (val) {
        return val;
    };
    IntegerTypeSync.prototype.diffSync = function (oldVal, newVal) {
        return newVal - oldVal;
    };
    IntegerTypeSync.prototype.patchSync = function (oldVal, diff) {
        return oldVal + diff;
    };
    IntegerTypeSync.prototype.revertSync = function (newVal, diff) {
        return newVal - diff;
    };
    return IntegerTypeSync;
}());
exports.IntegerTypeSync = IntegerTypeSync;
exports.IntegerType = type_1.promisifyClass(IntegerTypeSync);
