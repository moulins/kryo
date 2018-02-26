/**
 * @module kryo/builtins/sint16
 */

import { IntegerType } from "../types/integer";

export const $Sint16: IntegerType = new IntegerType({min: -32768, max: 32767});
