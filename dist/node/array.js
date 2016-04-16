"use strict";
var Promise = require("bluebird");
var _ = require("lodash");
var via_type_error_1 = require("./via-type-error");
var defaultOptions = {
    maxLength: 100
};
var ArrayType = (function () {
    function ArrayType(itemType, options) {
        this.isSync = true;
        this.name = "array";
        this.options = _.assign(_.clone(defaultOptions), options);
        this.isSync = itemType.isSync;
        this.itemType = itemType;
    }
    ArrayType.prototype.readTrustedSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "readTrusted");
    };
    ArrayType.prototype.readTrusted = function (format, val) {
        return this.read(format, val);
    };
    ArrayType.prototype.readSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "read");
    };
    ArrayType.prototype.read = function (format, val) {
        var _this = this;
        return Promise.try(function () {
            switch (format) {
                case "bson":
                case "json":
                    return Promise
                        .map(val, function (item, i, len) {
                        return _this.itemType.read(format, item);
                    });
                default:
                    return Promise.reject(new via_type_error_1.UnsupportedFormatError(format));
            }
        });
    };
    ArrayType.prototype.writeSync = function (format, val) {
        throw new Error("ArrayType does not support writeSync");
    };
    ArrayType.prototype.write = function (format, val) {
        var _this = this;
        return Promise.try(function () {
            switch (format) {
                case "bson":
                case "json":
                    return Promise
                        .map(val, function (item, i, len) {
                        return _this.itemType.write(format, item);
                    });
                default:
                    return Promise.reject(new via_type_error_1.UnsupportedFormatError(format));
            }
        });
    };
    ArrayType.prototype.testSync = function (val) {
        throw new Error("ArrayType does not support testSync");
    };
    ArrayType.prototype.test = function (val) {
        var _this = this;
        return Promise.try(function () {
            if (!_.isArray(val)) {
                return Promise.reject(new via_type_error_1.UnexpectedTypeError(typeof val, "array"));
            }
            if (_this.options.maxLength !== null && val.length > _this.options.maxLength) {
                return Promise.resolve(new Error("Array max length is " + _this.options.maxLength));
            }
            if (_this.itemType === null) {
                return Promise.resolve(null);
            }
            return Promise
                .map(val, function (item, i, len) {
                return _this.itemType.test(item);
            })
                .then(function (res) {
                var errors = [];
                for (var i = 0, l = res.length; i < l; i++) {
                    if (res[i] !== null) {
                        errors.push(new Error("Invalid type at index " + i));
                    }
                }
                if (errors.length) {
                    // return new _Error(errors, "typeError", "Failed test on items")
                    return new Error("Failed test on some items");
                }
                return null;
            });
        });
    };
    ArrayType.prototype.equalsSync = function (val1, val2) {
        throw new via_type_error_1.UnavailableSyncError(this, "equals");
    };
    ArrayType.prototype.equals = function (val1, val2) {
        return Promise.reject(new Error("ArrayType does not support equals"));
    };
    ArrayType.prototype.cloneSync = function (val) {
        throw new via_type_error_1.UnavailableSyncError(this, "clone");
    };
    ArrayType.prototype.clone = function (val) {
        return Promise.resolve(this.cloneSync(val));
    };
    ArrayType.prototype.diffSync = function (oldVal, newVal) {
        throw new via_type_error_1.UnavailableSyncError(this, "diff");
    };
    ArrayType.prototype.diff = function (oldVal, newVal) {
        return Promise.resolve(this.diffSync(oldVal, newVal));
    };
    ArrayType.prototype.patchSync = function (oldVal, diff) {
        throw new via_type_error_1.UnavailableSyncError(this, "patch");
    };
    ArrayType.prototype.patch = function (oldVal, diff) {
        return Promise.resolve(this.patchSync(oldVal, diff));
    };
    ArrayType.prototype.revertSync = function (newVal, diff) {
        throw new via_type_error_1.UnavailableSyncError(this, "revert");
    };
    ArrayType.prototype.revert = function (newVal, diff) {
        return Promise.resolve(this.revertSync(newVal, diff));
    };
    ArrayType.prototype.reflect = function (visitor) {
        var _this = this;
        return Promise.try(function () {
            visitor(_this.itemType, null, _this);
            if (_this.itemType.reflect) {
                _this.itemType.reflect(visitor);
            }
        });
    };
    ArrayType.prototype.diffToUpdate = function (newVal, diff, format) {
        var update = {
            $set: {},
            $unset: {}
        };
        return Promise.resolve(update);
    };
    return ArrayType;
}());
exports.ArrayType = ArrayType;
