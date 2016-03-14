"use strict";
var _ = require("lodash");
var type_1 = require("./interfaces/type");
var DateTypeSync = (function () {
    function DateTypeSync() {
        this.isSync = true;
        this.name = "date";
    }
    DateTypeSync.prototype.readSync = function (format, val) {
        switch (format) {
            case "json":
                if (_.isString(val)) {
                    val = Date.parse(val);
                }
                if (_.isFinite(val)) {
                    return new Date(val);
                }
                throw new Error("Expected value to be either string or finite number");
            case "bson":
                return val;
            default:
                throw new Error("Unsupported format");
        }
    };
    DateTypeSync.prototype.writeSync = function (format, val) {
        switch (format) {
            case "json":
                return val.toString();
            case "bson":
                return val;
            default:
                throw new Error("Unsupported format");
        }
    };
    DateTypeSync.prototype.testSync = function (val) {
        if (!(val instanceof Date)) {
            return new Error("Expected value to be instanceof Date");
        }
        if (isNaN(val.getTime())) {
            return new Error("Timestamp is NaN");
        }
        return null;
    };
    DateTypeSync.prototype.normalizeSync = function (val) {
        return val;
    };
    DateTypeSync.prototype.equalsSync = function (val1, val2) {
        return val1.getTime() === val2.getTime();
    };
    DateTypeSync.prototype.cloneSync = function (val) {
        return new Date(val.getTime());
    };
    DateTypeSync.prototype.diffSync = function (oldVal, newVal) {
        return newVal.getTime() - oldVal.getTime();
    };
    DateTypeSync.prototype.patchSync = function (oldVal, diff) {
        return new Date(oldVal.getTime() + diff);
    };
    DateTypeSync.prototype.revertSync = function (newVal, diff) {
        return new Date(newVal.getTime() - diff);
    };
    return DateTypeSync;
}());
exports.DateTypeSync = DateTypeSync;
exports.DateType = type_1.promisifyClass(DateTypeSync);
