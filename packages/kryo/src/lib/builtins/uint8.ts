/**
 * @module kryo/builtins/uint8
 */

import { IntegerType } from "../types/integer.js";

export const $Uint8: IntegerType = new IntegerType({min: 0, max: 255});
