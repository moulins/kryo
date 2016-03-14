"use strict";
var Promise = require("bluebird");
function promisify(typeSync) {
    var type = typeSync;
    type.isSync = true;
    if (!type.read) {
        type.read = function (format, val) {
            return Promise.try(this.readSync, [format, val], this);
        };
    }
    if (!type.write) {
        type.write = function (format, val) {
            return Promise.try(this.writeSync, [format, val], this);
        };
    }
    if (!type.test) {
        type.test = function (val) {
            return Promise.try(this.testSync, [val], this);
        };
    }
    if (!type.normalize) {
        type.normalize = function (val) {
            return Promise.try(this.normalizeSync, [val], this);
        };
    }
    if (!type.equals) {
        type.equals = function (val1, val2) {
            return Promise.try(this.equalsSync, [val1, val2], this);
        };
    }
    if (!type.clone) {
        type.clone = function (val) {
            return Promise.try(this.cloneSync, [val], this);
        };
    }
    if (!type.diff) {
        type.diff = function (oldVal, newVal) {
            return Promise.try(this.diffSync, [oldVal, newVal], this);
        };
    }
    if (!type.patch) {
        type.patch = function (oldVal, diff) {
            return Promise.try(this.patchSync, [oldVal, diff], this);
        };
    }
    if (!type.revert) {
        type.revert = function (newVal, diff) {
            return Promise.try(this.revertSync, [newVal, diff], this);
        };
    }
    return type;
}
exports.promisify = promisify;
function promisifyClass(typeSync) {
    promisify(typeSync.prototype);
    return typeSync;
}
exports.promisifyClass = promisifyClass;
