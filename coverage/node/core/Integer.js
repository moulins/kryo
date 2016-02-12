"use strict";
var Promise = require("bluebird");
var IntegerType = (function () {
    function IntegerType() {
        this.name = "boolean";
    }
    IntegerType.prototype.readSync = function (format, val) {
        return val;
    };
    IntegerType.prototype.read = function (format, val) {
        return Promise.resolve(val);
    };
    IntegerType.prototype.writeSync = function (format, val) {
        return val;
    };
    IntegerType.prototype.write = function (format, val) {
        return Promise.resolve(val);
    };
    IntegerType.prototype.testSync = function (val) {
        return typeof val === "number" && isFinite(val) && Math.floor(val) === val;
    };
    IntegerType.prototype.test = function (val) {
        return Promise.resolve(this.testSync(val));
    };
    IntegerType.prototype.normalizeSync = function (val) {
        return Math.floor(val);
    };
    IntegerType.prototype.normalize = function (val) {
        return Promise.resolve(Math.floor(val));
    };
    IntegerType.prototype.equalsSync = function (val1, val2) {
        return val1 === val2;
    };
    IntegerType.prototype.equals = function (val1, val2) {
        return Promise.resolve(val1 === val2);
    };
    IntegerType.prototype.cloneSync = function (val) {
        return val;
    };
    IntegerType.prototype.clone = function (val) {
        return Promise.resolve(val);
    };
    IntegerType.prototype.diffSync = function (oldVal, newVal) {
        return newVal - oldVal;
    };
    IntegerType.prototype.diff = function (oldVal, newVal) {
        return Promise.resolve(newVal - oldVal);
    };
    IntegerType.prototype.patchSync = function (oldVal, diff) {
        return oldVal + diff;
    };
    IntegerType.prototype.patch = function (oldVal, diff) {
        return Promise.resolve(oldVal + diff);
    };
    IntegerType.prototype.revertSync = function (newVal, diff) {
        return newVal - diff;
    };
    IntegerType.prototype.revert = function (newVal, diff) {
        return Promise.resolve(newVal - diff);
    };
    return IntegerType;
}());
exports.IntegerType = IntegerType;
