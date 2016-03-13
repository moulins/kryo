"use strict";
var type_1 = require("./interfaces/type");
var defaultOptions = {
    regex: null,
    lowerCase: false,
    trimmed: false,
    minLength: null,
    maxLength: null
};
var StringTypeSync = (function () {
    function StringTypeSync(options) {
        this.isSync = true;
        this.name = "string";
        this.options = _.assign(_.clone(defaultOptions), options);
    }
    StringTypeSync.prototype.readSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return String(val);
            default:
                throw new Error("Unsupported format");
        }
    };
    StringTypeSync.prototype.writeSync = function (format, val) {
        switch (format) {
            case "json":
            case "bson":
                return String(val);
            default:
                throw new Error("Unsupported format");
        }
    };
    StringTypeSync.prototype.testSync = function (val) {
        if (!_.isString(val)) {
            return new Error("Expected string");
        }
        if (this.options.lowerCase) {
            if (val !== val.toLowerCase()) {
                return new Error("Expected lower case string.");
            }
        }
        if (this.options.trimmed) {
            if (val !== _.trim(val)) {
                return new Error("Expected trimmed string.");
            }
        }
        if (this.options.regex !== null) {
            if (!this.options.regex.test(val)) {
                return new Error("Expected string to match pattern");
            }
        }
        var minLength = this.options.minLength;
        if (minLength !== null && val.length < minLength) {
            return new Error("Expected string longer than " + minLength + ".");
        }
        var maxLength = this.options.maxLength;
        if (maxLength !== null && val.length > maxLength) {
            return new Error("Expected string shorter than " + maxLength + ".");
        }
        return null;
    };
    StringTypeSync.prototype.normalizeSync = function (val) {
        return String(val);
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
    return StringTypeSync;
}());
exports.StringTypeSync = StringTypeSync;
exports.StringType = type_1.promisifyClass(StringTypeSync);
