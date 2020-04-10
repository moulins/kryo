/**
 * @module kryo/builtins/sint16
 */

import { IntegerType } from "../integer.js";

export const $Sint16: IntegerType = new IntegerType({min: -32768, max: 32767});
