import { CaseStyle } from "../../../lib/core.js";
import { IntegerType } from "../../../lib/types/integer.js";
import { LiteralType } from "../../../lib/types/literal.js";
import { RecordType } from "../../../lib/types/record.js";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base.js";
import { $FsNodeType, FsNodeType } from "./fs-node-type.js";

export interface File extends FsNodeBase {
  tag: FsNodeType.File;
  size: number;
}

export const $File: RecordType<File> = new RecordType<File>(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.File>({type: $FsNodeType, value: FsNodeType.File})},
    size: {type: new IntegerType()},
  },
  changeCase: CaseStyle.SnakeCase,
}));
