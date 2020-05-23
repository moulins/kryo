import { ArrayType } from "../../../lib/array.js";
import { CaseStyle } from "../../../lib/index.js";
import { LiteralType } from "../../../lib/literal.js";
import { RecordType } from "../../../lib/record.js";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base.js";
import { $FsNodeType, FsNodeType } from "./fs-node-type.js";
import { $FsNode, FsNode } from "./fs-node.js";

export interface Directory extends FsNodeBase {
  tag: FsNodeType.Directory;
  children?: FsNode[];
}

export const $Directory: RecordType<Directory> = new RecordType(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.Directory>({type: $FsNodeType, value: FsNodeType.Directory})},
    children: {type: new ArrayType({itemType: $FsNode, maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
}));
