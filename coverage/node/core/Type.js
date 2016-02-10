"use strict";
/*
 * Type
 *
 * mixed parsed Type:read(string format, mixed val)
 *
 * mixed formatted Type:write(string format, mixed val)
 *
 * boolean/Error testResult Type:test(mixed val)
 *
 * boolean isEqual Type:equals(mixed val1, mixed val2)
 *
 * mixed diff Type:diff(mixed old, mixed new)
 *
 * mixed new Type:patch(mixed old, mixed diff)
 *
 * mixed old Type:revert(mixed new, mixed diff)
 *
 */
var Type = (function () {
    function Type() {
        this.name = 'abstractType';
        this.options = {};
    }
    return Type;
}());
module.exports = Type;
