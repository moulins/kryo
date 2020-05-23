import { CaseStyle } from "../../../lib/index.js";
import { RecordType } from "../../../lib/record.js";
import { Ucs2StringType } from "../../../lib/ucs2-string.js";
import { $FsNodeType, FsNodeType } from "./fs-node-type.js";

export interface FsNodeBase {
  tag: FsNodeType;
  name: string;
}

export const $FsNodeBase: RecordType<FsNodeBase> = new RecordType({
  properties: {
    tag: {type: $FsNodeType},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});
