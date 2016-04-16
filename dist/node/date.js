"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var promisify_1 = require("./helpers/promisify");
var via_type_error_1 = require("./via-type-error");
var DateTypeError = (function (_super) {
    __extends(DateTypeError, _super);
    function DateTypeError() {
        _super.apply(this, arguments);
    }
    return DateTypeError;
}(via_type_error_1.ViaTypeError));
exports.DateTypeError = DateTypeError;
var ReadJsonDateError = (function (_super) {
    __extends(ReadJsonDateError, _super);
    function ReadJsonDateError(val) {
        _super.call(this, null, "ReadJsonDateError", { value: val }, "Expected either string representation of date or finite integer");
    }
    return ReadJsonDateError;
}(DateTypeError));
exports.ReadJsonDateError = ReadJsonDateError;
var NanTimestampError = (function (_super) {
    __extends(NanTimestampError, _super);
    function NanTimestampError(date) {
        _super.call(this, null, "NanTimestampError", { date: date }, "Expected timestamp to not be NaN");
    }
    return NanTimestampError;
}(DateTypeError));
exports.NanTimestampError = NanTimestampError;
var DateTypeSync = (function () {
    function DateTypeSync() {
        this.isSync = true;
        this.name = "date";
    }
    DateTypeSync.prototype.readTrustedSync = function (format, val) {
        throw this.readSync(format, val);
    };
    DateTypeSync.prototype.readSync = function (format, val) {
        switch (format) {
            case "json":
                if (_.isString(val)) {
                    val = Date.parse(val);
                }
                if (_.isFinite(val)) {
                    return new Date(val);
                }
                throw new ReadJsonDateError(val);
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    DateTypeSync.prototype.writeSync = function (format, val) {
        switch (format) {
            case "json":
                return val.toJSON(); // ISO8601 string with millisecond precision
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    DateTypeSync.prototype.testSync = function (val) {
        if (!(val instanceof Date)) {
            return new DateTypeError(null, "DateTypeError", { value: val }, "Expected value to be instanceof Date");
        }
        if (isNaN(val.getTime())) {
            return new NanTimestampError(val);
        }
        return null;
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
exports.DateType = promisify_1.promisifyClass(DateTypeSync);
