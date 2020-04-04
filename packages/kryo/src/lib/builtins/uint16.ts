/**
 * @module kryo/builtins/uint16
 */

import { IntegerType } from "../types/integer.js";

export const $Uint16: IntegerType = new IntegerType({min: 0, max: 65535});
