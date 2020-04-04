/**
 * @module kryo/builtins/bytes
 */

import { BytesType } from "../types/bytes.js";

export const $Bytes: BytesType = new BytesType({maxLength: Infinity});
