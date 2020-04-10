/**
 * @module kryo/builtins/bytes
 */

import { BytesType } from "../bytes.js";

export const $Bytes: BytesType = new BytesType({maxLength: Infinity});
