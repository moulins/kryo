"use strict";
var promisify_1 = require("./helpers/promisify");
var via_type_error_1 = require("./helpers/via-type-error");
var BooleanTypeSync = (function () {
    function BooleanTypeSync() {
        this.isSync = true;
        this.name = "boolean";
    }
    BooleanTypeSync.prototype.readTrustedSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    BooleanTypeSync.prototype.readSync = function (format, val) {
        var res = this.readTrustedSync(format, val);
        var err = this.testSync(res);
        if (err !== null) {
            throw err;
        }
        return res;
    };
    BooleanTypeSync.prototype.writeSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    BooleanTypeSync.prototype.testSync = function (val) {
        if (typeof val !== "boolean") {
            return new via_type_error_1.UnexpectedTypeError(typeof val, "boolean");
        }
        return null;
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
