import { CaseStyle } from "../../../lib/case-style.js";
import { ArrayType } from "../../../lib/types/array.js";
import { DocumentType } from "../../../lib/types/document.js";
import { LiteralType } from "../../../lib/types/literal.js";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base.js";
import { $FsNodeType, FsNodeType } from "./fs-node-type.js";
import { $FsNode, FsNode } from "./fs-node.js";

export interface Directory extends FsNodeBase {
  tag: FsNodeType.Directory;
  children: FsNode[];
}

export const $Directory: DocumentType<Directory> = new DocumentType<Directory>(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.Directory>({type: $FsNodeType, value: FsNodeType.Directory})},
    children: {type: new ArrayType({itemType: $FsNode, maxLength: Infinity}), optional: true},
  },
  changeCase: CaseStyle.SnakeCase,
}));
