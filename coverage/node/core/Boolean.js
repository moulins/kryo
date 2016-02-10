"use strict";
var Promise = require("bluebird");
var BooleanType = (function () {
    function BooleanType() {
        this.name = "boolean";
    }
    BooleanType.prototype.readSync = function (format, val) {
        return Boolean(val);
    };
    BooleanType.prototype.read = function (format, val) {
        return Promise.resolve(Boolean(val));
    };
    BooleanType.prototype.writeSync = function (format, val) {
        return Boolean(val);
    };
    BooleanType.prototype.write = function (format, val) {
        return Promise.resolve(Boolean(val));
    };
    BooleanType.prototype.testSync = function (val) {
        if (typeof val !== "boolean") {
            return new Error('Expected typeof val to be "boolean"');
        }
        return true;
    };
    BooleanType.prototype.test = function (val) {
        return Promise.resolve(this.testSync(val));
    };
    BooleanType.prototype.normalizeSync = function (val) {
        return Boolean(val);
    };
    BooleanType.prototype.normalize = function (val) {
        return Promise.resolve(Boolean(val));
    };
    BooleanType.prototype.equalsSync = function (val1, val2) {
        return val1 === val2;
    };
    BooleanType.prototype.equals = function (val1, val2) {
        return Promise.resolve(val1 === val2);
    };
    BooleanType.prototype.cloneSync = function (val) {
        return val;
    };
    BooleanType.prototype.clone = function (val) {
        return Promise.resolve(val);
    };
    BooleanType.prototype.diffSync = function (oldVal, newVal) {
        return oldVal !== newVal;
    };
    BooleanType.prototype.diff = function (oldVal, newVal) {
        return Promise.resolve(oldVal !== newVal);
    };
    BooleanType.prototype.patchSync = function (oldVal, diff) {
        return diff ? !oldVal : oldVal;
    };
    BooleanType.prototype.patch = function (oldVal, diff) {
        return Promise.resolve(diff ? !oldVal : oldVal);
    };
    BooleanType.prototype.revertSync = function (newVal, diff) {
        return diff ? !newVal : newVal;
    };
    BooleanType.prototype.revert = function (newVal, diff) {
        return Promise.resolve(diff ? !newVal : newVal);
    };
    return BooleanType;
}());
exports.BooleanType = BooleanType;
