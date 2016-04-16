"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var promisify_1 = require("./helpers/promisify");
var via_type_error_1 = require("./via-type-error");
var IntegerTypeError = (function (_super) {
    __extends(IntegerTypeError, _super);
    function IntegerTypeError() {
        _super.apply(this, arguments);
    }
    return IntegerTypeError;
}(via_type_error_1.ViaTypeError));
exports.IntegerTypeError = IntegerTypeError;
var NumericError = (function (_super) {
    __extends(NumericError, _super);
    function NumericError(value) {
        _super.call(this, null, "NumericError", { value: value }, "Value is not a finite integer");
    }
    return NumericError;
}(IntegerTypeError));
exports.NumericError = NumericError;
var IntegerTypeSync = (function () {
    function IntegerTypeSync() {
        this.isSync = true;
        this.name = "boolean";
    }
    IntegerTypeSync.prototype.readTrustedSync = function (format, val) {
        throw this.readSync(format, val);
    };
    IntegerTypeSync.prototype.readSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    IntegerTypeSync.prototype.writeSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    IntegerTypeSync.prototype.testSync = function (val) {
        if (!(typeof val === "number")) {
            return new via_type_error_1.UnexpectedTypeError(typeof val, "number");
        }
        if (!isFinite(val) || Math.floor(val) !== val) {
            return new NumericError(val);
        }
        return null;
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
exports.IntegerType = promisify_1.promisifyClass(IntegerTypeSync);
