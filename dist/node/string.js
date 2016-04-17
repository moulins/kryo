"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _ = require("lodash");
var promisify_1 = require("./helpers/promisify");
var via_type_error_1 = require("./helpers/via-type-error");
var StringTypeError = (function (_super) {
    __extends(StringTypeError, _super);
    function StringTypeError() {
        _super.apply(this, arguments);
    }
    return StringTypeError;
}(via_type_error_1.ViaTypeError));
exports.StringTypeError = StringTypeError;
var LowerCaseError = (function (_super) {
    __extends(LowerCaseError, _super);
    function LowerCaseError(string) {
        _super.call(this, null, "CaseError", { string: string }, "Expected string to be lowercase");
    }
    return LowerCaseError;
}(StringTypeError));
exports.LowerCaseError = LowerCaseError;
var TrimError = (function (_super) {
    __extends(TrimError, _super);
    function TrimError(string) {
        _super.call(this, null, "TrimError", { string: string }, "Expected string to be trimmed");
    }
    return TrimError;
}(StringTypeError));
exports.TrimError = TrimError;
var PatternError = (function (_super) {
    __extends(PatternError, _super);
    function PatternError(string, pattern) {
        _super.call(this, null, "PatternError", { string: string, pattern: pattern }, "Expected string to follow pattern " + pattern);
    }
    return PatternError;
}(StringTypeError));
exports.PatternError = PatternError;
var MinLengthError = (function (_super) {
    __extends(MinLengthError, _super);
    function MinLengthError(string, minLength) {
        _super.call(this, null, "MinLengthError", { string: string, minLength: minLength }, "Expected string length (" + string.length + ") to be greater than or equal to " + minLength);
    }
    return MinLengthError;
}(StringTypeError));
exports.MinLengthError = MinLengthError;
var MaxLengthError = (function (_super) {
    __extends(MaxLengthError, _super);
    function MaxLengthError(string, maxLength) {
        _super.call(this, null, "MaxLengthError", { string: string, maxLength: maxLength }, "Expected string length (" + string.length + ") to be less than or equal to " + maxLength);
    }
    return MaxLengthError;
}(StringTypeError));
exports.MaxLengthError = MaxLengthError;
var defaultOptions = {
    regex: null,
    lowerCase: false,
    trimmed: false,
    minLength: null,
    maxLength: null,
    looseTest: false
};
var StringTypeSync = (function () {
    function StringTypeSync(options) {
        this.isSync = true;
        this.name = "string";
        this.options = _.assign(_.clone(defaultOptions), options);
    }
    StringTypeSync.prototype.readTrustedSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    StringTypeSync.prototype.readSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return String(val);
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    StringTypeSync.prototype.writeSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return val;
            default:
                throw new via_type_error_1.UnsupportedFormatError(format);
        }
    };
    StringTypeSync.prototype.testSync = function (val, opt) {
        var options = StringTypeSync.mergeOptions(this.options, opt);
        if (!(typeof val === "string")) {
            return new via_type_error_1.UnexpectedTypeError(typeof val, "string");
        }
        if (options.lowerCase) {
            if (val !== val.toLowerCase()) {
                return new LowerCaseError(val);
            }
        }
        if (options.trimmed) {
            if (val !== _.trim(val)) {
                return new TrimError(val);
            }
        }
        if (options.regex !== null) {
            if (!options.regex.test(val)) {
                return new PatternError(val, options.regex);
            }
        }
        var minLength = options.minLength;
        if (minLength !== null && val.length < minLength) {
            return new MinLengthError(val, minLength);
        }
        var maxLength = options.maxLength;
        if (maxLength !== null && val.length > maxLength) {
            return new MaxLengthError(val, maxLength);
        }
        return null;
    };
    StringTypeSync.prototype.equalsSync = function (val1, val2) {
        return val1 === val2;
    };
    StringTypeSync.prototype.cloneSync = function (val) {
        return val;
    };
    StringTypeSync.prototype.diffSync = function (oldVal, newVal) {
        return [oldVal, newVal];
    };
    StringTypeSync.prototype.patchSync = function (oldVal, diff) {
        return diff[1];
    };
    StringTypeSync.prototype.revertSync = function (newVal, diff) {
        return diff[0];
    };
    StringTypeSync.assignOptions = function (target, source) {
        if (!source) {
            return target || {};
        }
        _.assign(target, source);
        return target;
    };
    StringTypeSync.cloneOptions = function (source) {
        return StringTypeSync.assignOptions({}, source);
    };
    StringTypeSync.mergeOptions = function (target, source) {
        return StringTypeSync.assignOptions(StringTypeSync.cloneOptions(target), source);
    };
    return StringTypeSync;
}());
exports.StringTypeSync = StringTypeSync;
exports.StringType = promisify_1.promisifyClass(StringTypeSync);
