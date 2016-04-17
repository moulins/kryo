"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var incident_1 = require("incident");
var ViaTypeError = (function (_super) {
    __extends(ViaTypeError, _super);
    function ViaTypeError() {
        _super.apply(this, arguments);
    }
    return ViaTypeError;
}(incident_1.Incident));
exports.ViaTypeError = ViaTypeError;
var UnsupportedFormatError = (function (_super) {
    __extends(UnsupportedFormatError, _super);
    function UnsupportedFormatError(format) {
        _super.call(this, null, "UnsupportedFormat", { format: format }, "Unsupported format " + format);
    }
    return UnsupportedFormatError;
}(ViaTypeError));
exports.UnsupportedFormatError = UnsupportedFormatError;
var UnexpectedTypeError = (function (_super) {
    __extends(UnexpectedTypeError, _super);
    function UnexpectedTypeError(actualTypeName, expectedTypeName) {
        _super.call(this, null, "UnexpectedType", { actualType: actualTypeName, expectedType: expectedTypeName }, "Expected type " + expectedTypeName + ", received " + actualTypeName);
    }
    return UnexpectedTypeError;
}(ViaTypeError));
exports.UnexpectedTypeError = UnexpectedTypeError;
var UnavailableSyncError = (function (_super) {
    __extends(UnavailableSyncError, _super);
    function UnavailableSyncError(type, methodName) {
        _super.call(this, null, "UnexpectedType", { type: methodName, methodName: methodName }, "Synchronous " + methodName + " for " + type.name + " is not available");
    }
    return UnavailableSyncError;
}(ViaTypeError));
exports.UnavailableSyncError = UnavailableSyncError;
