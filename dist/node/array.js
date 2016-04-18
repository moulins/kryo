"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Bluebird = require("bluebird");
var _ = require("lodash");
var via_type_error_1 = require("./helpers/via-type-error");
var defaultOptions = {
    maxLength: 100,
    itemType: null
};
var ArrayTypeError = (function (_super) {
    __extends(ArrayTypeError, _super);
    function ArrayTypeError() {
        _super.apply(this, arguments);
    }
    return ArrayTypeError;
}(via_type_error_1.ViaTypeError));
exports.ArrayTypeError = ArrayTypeError;
var ItemsTestError = (function (_super) {
    __extends(ItemsTestError, _super);
    function ItemsTestError(errors) {
        var errorDetails = "";
        var first = true;
        for (var index in errors) {
            errorDetails = errorDetails + (first ? "" : ", ") + index + ": " + errors[index];
            first = false;
        }
        _super.call(this, null, "ArrayTypeError", { errors: errors }, "Failed test for the items: {" + errorDetails + "}");
    }
    return ItemsTestError;
}(ArrayTypeError));
exports.ItemsTestError = ItemsTestError;
var MaxLengthError = (function (_super) {
    __extends(MaxLengthError, _super);
    function MaxLengthError(array, maxLength) {
        _super.call(this, null, "via-type-array-maxlength", { array: array, maxLength: maxLength }, "Expected array length (" + array.length + ") to be less than or equal to " + maxLength);
    }
    return MaxLengthError;
}(ArrayTypeError));
exports.MaxLengthError = MaxLengthError;
var ArrayType = (function () {
    function ArrayType(options) {
        this.isSync = true;
        this.name = "array";
        this.options = _.assign(_.clone(defaultOptions), options);
        this.isSync = this.options.itemType.isSync;
    }
    ArrayType.prototype.readTrustedSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "readTrusted");
    };
    ArrayType.prototype.readTrusted = function (format, val, opt) {
        var _this = this;
        return Bluebird.try(function () {
            var options = _this.options;
            switch (format) {
                case "bson":
                case "json":
                    return Bluebird
                        .map(val, function (item, i, len) {
                        if (item === null) {
                            return null;
                        }
                        return options.itemType.readTrusted(format, item);
                    });
                default:
                    return Bluebird.reject(new via_type_error_1.UnsupportedFormatError(format));
            }
        });
    };
    ArrayType.prototype.readSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "read");
    };
    ArrayType.prototype.read = function (format, val) {
        var _this = this;
        return Bluebird.try(function () {
            var options = _this.options;
            switch (format) {
                case "bson":
                case "json":
                    return Bluebird
                        .map(val, function (item, i, len) {
                        if (item === null) {
                            return null;
                        }
                        return options.itemType.read(format, item);
                    });
                default:
                    return Bluebird.reject(new via_type_error_1.UnsupportedFormatError(format));
            }
        });
    };
    ArrayType.prototype.writeSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "write");
    };
    ArrayType.prototype.write = function (format, val) {
        var _this = this;
        return Bluebird.try(function () {
            var options = _this.options;
            switch (format) {
                case "bson":
                case "json":
                    return Bluebird
                        .map(val, function (item, i, len) {
                        return options.itemType.write(format, item);
                    });
                default:
                    return Bluebird.reject(new via_type_error_1.UnsupportedFormatError(format));
            }
        });
    };
    ArrayType.prototype.testSync = function (val) {
        throw new via_type_error_1.UnavailableSyncError(this, "test");
    };
    ArrayType.prototype.test = function (val) {
        var _this = this;
        return Bluebird.try(function () {
            var options = _this.options;
            if (!_.isArray(val)) {
                return Bluebird.reject(new via_type_error_1.UnexpectedTypeError(typeof val, "array"));
            }
            if (options.maxLength !== null && val.length > options.maxLength) {
                return Bluebird.resolve(new MaxLengthError(val, options.maxLength));
            }
            if (options.itemType === null) {
                return Bluebird.resolve(null);
            }
            return Bluebird
                .map(val, function (item, i, len) {
                return options.itemType.test(item);
            })
                .then(function (res) {
                var errors = {};
                var noErrors = true;
                for (var i = 0, l = res.length; i < l; i++) {
                    if (res[i] !== null) {
                        errors[i] = res[i];
                        noErrors = false;
                    }
                }
                if (!noErrors) {
                    return new ItemsTestError(errors);
                }
                return null;
            });
        });
    };
    ArrayType.prototype.equalsSync = function (val1, val2) {
        throw new via_type_error_1.UnavailableSyncError(this, "equals");
    };
    ArrayType.prototype.equals = function (val1, val2) {
        return Bluebird.reject(new via_type_error_1.ViaTypeError("todo", "ArrayType does not support equals"));
    };
    ArrayType.prototype.cloneSync = function (val) {
        throw new via_type_error_1.UnavailableSyncError(this, "clone");
    };
    ArrayType.prototype.clone = function (val) {
        return Bluebird.resolve(this.cloneSync(val));
    };
    ArrayType.prototype.diffSync = function (oldVal, newVal) {
        throw new via_type_error_1.UnavailableSyncError(this, "diff");
    };
    ArrayType.prototype.diff = function (oldVal, newVal) {
        return Bluebird.resolve(this.diffSync(oldVal, newVal));
    };
    ArrayType.prototype.patchSync = function (oldVal, diff) {
        throw new via_type_error_1.UnavailableSyncError(this, "patch");
    };
    ArrayType.prototype.patch = function (oldVal, diff) {
        return Bluebird.resolve(this.patchSync(oldVal, diff));
    };
    ArrayType.prototype.revertSync = function (newVal, diff) {
        throw new via_type_error_1.UnavailableSyncError(this, "revert");
    };
    ArrayType.prototype.revert = function (newVal, diff) {
        return Bluebird.resolve(this.revertSync(newVal, diff));
    };
    ArrayType.prototype.reflect = function (visitor) {
        var _this = this;
        return Bluebird.try(function () {
            var options = _this.options;
            visitor(options.itemType, null, _this);
            if (options.itemType.reflect) {
                options.itemType.reflect(visitor);
            }
        });
    };
    ArrayType.prototype.diffToUpdate = function (newVal, diff, format) {
        var update = {
            $set: {},
            $unset: {}
        };
        return Bluebird.resolve(update);
    };
    return ArrayType;
}());
exports.ArrayType = ArrayType;
