import { CaseStyle } from "../../../lib/index.js";
import { IntegerType } from "../../../lib/integer.js";
import { LiteralType } from "../../../lib/literal.js";
import { RecordType } from "../../../lib/record.js";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base.js";
import { $FsNodeType, FsNodeType } from "./fs-node-type.js";

export interface File extends FsNodeBase {
  tag: FsNodeType.File;
  size: number;
}

export const $File: RecordType<File> = new RecordType(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.File>({type: $FsNodeType, value: FsNodeType.File})},
    size: {type: new IntegerType()},
  },
  changeCase: CaseStyle.SnakeCase,
}));
