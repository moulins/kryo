"use strict";
var Promise = require("bluebird");
var _ = require("lodash");
var defaultOptions = {
    additionalProperties: false,
    properties: {}
};
var DocumentType = (function () {
    function DocumentType(options) {
        this.isSync = true;
        this.name = "document";
        this.options = _.assign(_.clone(defaultOptions), options);
        this.updatedIsSync();
    }
    DocumentType.prototype.updatedIsSync = function () {
        this.isSync = true;
        for (var key in this.options.properties) {
            var property = this.options.properties[key];
            if (!property.type.isSync) {
                this.isSync = false;
                break;
            }
        }
        return this.isSync;
    };
    DocumentType.prototype.readSync = function (format, val) {
        throw new Error("DocumentType does not support readSync");
    };
    DocumentType.prototype.read = function (format, val) {
        var _this = this;
        return Promise.try(function () {
            switch (format) {
                case "bson":
                case "json":
                    if (!_.isPlainObject(val)) {
                        return Promise.reject(new Error("Expected plain object"));
                    }
                    val = val;
                    return Promise
                        .props(_.mapValues(val, function (member, key, doc) {
                        if (key in _this.options.properties) {
                            return _this.options.properties[key].type.read(format, member);
                        }
                        else {
                            return Promise.reject(new Error("Unknown property " + key));
                        }
                    }));
                default:
                    return Promise.reject(new Error("Format is not supported"));
            }
        });
    };
    DocumentType.prototype.writeSync = function (format, val) {
        throw new Error("DocumentType does not support writeSync");
    };
    DocumentType.prototype.write = function (format, val) {
        var _this = this;
        return Promise.try(function () {
            switch (format) {
                case "bson":
                case "json":
                    return Promise
                        .props(_.mapValues(val, function (member, key, doc) {
                        if (key in _this.options.properties) {
                            return _this.options.properties[key].type.write(format, member);
                        }
                        else {
                            return Promise.reject(new Error("DocumentType:write -> unknown field " + key));
                        }
                    }));
                default:
                    return Promise.reject(new Error("Format is not supported"));
            }
        });
    };
    DocumentType.prototype.testSync = function (val) {
        throw new Error("DocumentType does not support testSync");
    };
    DocumentType.prototype.test = function (val) {
        var _this = this;
        return Promise.try(function () {
            // let options: DocumentOptions = _.merge({}, this.options, opt);
            var options = _this.options;
            // TODO: keep this test ?
            if (!_.isPlainObject(val)) {
                return Promise.resolve(new Error("Expected plain object"));
            }
            var curKeys = _.keys(val);
            var expectedKeys = _.keys(_this.options.properties);
            if (!options.additionalProperties) {
                var extraKeys = _.difference(curKeys, expectedKeys);
                if (extraKeys.length) {
                    return Promise.resolve(new Error("Unexpected extra keys: " + extraKeys.join(", ")));
                }
            }
            // if (!options.allowPartial) {
            //   let missingKeys: string[] = _.difference(expectedKeys, curKeys);
            //   if (missingKeys.length) {
            //     return new Error("Expected missing keys: "+missingKeys);
            //   }
            // }
            curKeys = _.intersection(curKeys, expectedKeys);
            return Promise
                .map(curKeys, function (key, i, len) {
                return _this.options.properties[key].type
                    .test(val[key])
                    .then(function (err) {
                    return [key, err];
                });
            })
                .then(function (results) {
                var errors = [];
                for (var i = 0, l = results.length; i < l; i++) {
                    var key = results[i][0];
                    var err = results[i][1];
                    if (err !== null) {
                        // errors.push(new Error(err, "Invalid value at field "+results[i][0]))
                        errors.push(new Error("Invalid value at field " + key + ": " + err.message));
                    }
                }
                if (errors.length) {
                    return new Error("Failed test for some properties");
                }
                return null;
            });
        });
    };
    DocumentType.prototype.normalizeSync = function (val) {
        throw new Error("DocumentType does not support normalizeSync");
    };
    DocumentType.prototype.normalize = function (val) {
        return Promise.resolve(val);
    };
    DocumentType.prototype.equalsSync = function (val1, val2) {
        throw new Error("DocumentType does not support equalsSync");
    };
    DocumentType.prototype.equals = function (val1, val2, options) {
        var _this = this;
        return Promise
            .try(function () {
            var keys = _.keys(_this.options.properties);
            var val1Keys = _.intersection(keys, _.keys(val1));
            var val2Keys = _.intersection(keys, _.keys(val2));
            if (val1Keys.length === keys.length && val2Keys.length === keys.length) {
                return Promise.resolve(keys);
            }
            // if (!options || !options.partial) {
            //   return Promise.resolve(new Error("Missing keys"));
            // }
            var extraKeys = _.difference(val1Keys, val2Keys);
            var missingKeys = _.difference(val2Keys, val1Keys);
            if (extraKeys.length) {
                return Promise.reject(new Error("First argument has extra keys: " + extraKeys.join(", ")));
            }
            if (missingKeys.length) {
                return Promise.reject(new Error("First argument has missing keys: " + missingKeys.join(", ")));
            }
            return Promise.resolve(val1Keys);
        })
            .then(function (keys) {
            return Promise
                .map(keys, function (key) {
                var property = _this.options.properties[key];
                return property.type.equals(val1[key], val2[key]);
            })
                .then(function (equalsResults) {
                var equals = equalsResults.indexOf(false) < 0;
                if (equals) {
                    return Promise.resolve(true);
                }
                else if (options && options.throw) {
                    var diffKeys = _.filter(keys, function (key, index) { return equalsResults[index] === false; });
                    return Promise.reject("The objects are not equal because the following keys are not equal: " + diffKeys.join(", "));
                }
                else {
                    return Promise.resolve(false);
                }
            });
        })
            .catch(function (err) {
            if (options && options.throw) {
                return Promise.reject(err);
            }
            else {
                return Promise.resolve(false);
            }
        });
    };
    DocumentType.prototype.cloneSync = function (val) {
        throw new Error("DocumentType does not support cloneSync");
    };
    DocumentType.prototype.clone = function (val) {
        return Promise.resolve(this.cloneSync(val));
    };
    DocumentType.prototype.diffSync = function (oldVal, newVal) {
        throw new Error("DocumentType does not support diffSync");
    };
    DocumentType.prototype.diff = function (oldVal, newVal) {
        return Promise.resolve(this.diffSync(oldVal, newVal));
    };
    DocumentType.prototype.patchSync = function (oldVal, diff) {
        throw new Error("DocumentType does not support patchSync");
    };
    DocumentType.prototype.patch = function (oldVal, diff) {
        return Promise.resolve(this.patchSync(oldVal, diff));
    };
    DocumentType.prototype.revertSync = function (newVal, diff) {
        throw new Error("DocumentType does not support revertSync");
    };
    DocumentType.prototype.revert = function (newVal, diff) {
        return Promise.resolve(this.revertSync(newVal, diff));
    };
    // forEach (value:any, visitor:(childValue: any, key: string, childType: Type, self: CollectionType) => any): Promise<any> {
    //   let childType: Type|CollectionType;
    //   for(let key in this.properties){
    //     if (!(key in value)) {
    //       continue
    //     }
    //     childType = this.properties[key];
    //     iterator(value[key], key, childType, this);
    //     if ((<CollectionType>childType).forEach) {
    //       (<CollectionType>childType).forEach(value[key], visitor);
    //     }
    //   }
    //   return undefined;
    // }
    DocumentType.prototype.reflect = function (visitor) {
        var _this = this;
        return Promise.try(function () {
            var childType;
            for (var prop in _this.options.properties) {
                childType = _this.options.properties[prop].type;
                visitor(childType, prop, _this);
                if (childType.reflect) {
                    childType.reflect(visitor);
                }
            }
        });
    };
    return DocumentType;
}());
exports.DocumentType = DocumentType;
