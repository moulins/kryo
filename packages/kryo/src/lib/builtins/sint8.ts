/**
 * @module kryo/builtins/sint8
 */

import { IntegerType } from "../integer.js";

export const $Sint8: IntegerType = new IntegerType({min: -128, max: 127});
