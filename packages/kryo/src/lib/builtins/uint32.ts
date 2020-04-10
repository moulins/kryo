/**
 * @module kryo/builtins/uint32
 */

import { IntegerType } from "../integer.js";

export const $Uint32: IntegerType = new IntegerType({min: 0, max: 4294967295});
