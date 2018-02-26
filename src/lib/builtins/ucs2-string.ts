/**
 * @module kryo/builtins/ucs2-string
 */

import { Ucs2StringType } from "../types/ucs2-string";

export const $Ucs2String: Ucs2StringType = new Ucs2StringType({maxLength: Infinity});
