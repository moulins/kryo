export {ArrayType} from "./array";
export {BooleanType, BooleanTypeSync} from "./boolean";
export {DateType, DateTypeSync} from "./date";
export {DocumentType, DocumentOptions, PropertyDescriptor} from "./document";
export {IntegerType, IntegerTypeSync} from "./integer";
export {StringType, StringTypeSync} from "./string";

import {dotPath} from "via-core";

let foo: dotPath.ParsedDotPath = dotPath.parse("foo.Bar");
console.log(foo);
