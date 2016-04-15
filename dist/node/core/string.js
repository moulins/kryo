"use strict";
var _ = require("lodash");
var promisify_1 = require("./helpers/promisify");
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
    StringTypeSync.prototype.testSync = function (val, opt) {
        var options = StringTypeSync.mergeOptions(this.options, opt);
        if (!(typeof val === "string")) {
            return new Error("Expected string");
        }
        // if (options.looseTest) {
        //   return null;
        // }
        if (options.lowerCase) {
            if (val !== val.toLowerCase()) {
                return new Error("Expected lower case string.");
            }
        }
        if (options.trimmed) {
            if (val !== _.trim(val)) {
                return new Error("Expected trimmed string.");
            }
        }
        if (options.regex !== null) {
            if (!this.options.regex.test(val)) {
                return new Error("Expected string to match pattern");
            }
        }
        var minLength = options.minLength;
        if (minLength !== null && val.length < minLength) {
            return new Error("Expected string longer than " + minLength + ".");
        }
        var maxLength = options.maxLength;
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
