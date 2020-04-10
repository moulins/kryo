/**
 * @module kryo/builtins/ucs2-string
 */

import { Ucs2StringType } from "../ucs2-string.js";

export const $Ucs2String: Ucs2StringType = new Ucs2StringType({maxLength: Infinity});
