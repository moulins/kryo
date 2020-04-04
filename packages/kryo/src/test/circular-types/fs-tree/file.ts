import { CaseStyle } from "../../../lib/case-style.js";
import { DocumentType } from "../../../lib/types/document.js";
import { IntegerType } from "../../../lib/types/integer.js";
import { LiteralType } from "../../../lib/types/literal.js";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base.js";
import { $FsNodeType, FsNodeType } from "./fs-node-type.js";

export interface File extends FsNodeBase {
  tag: FsNodeType.File;
  size: number;
}

export const $File: DocumentType<File> = new DocumentType<File>(() => ({
  properties: {
    ...$FsNodeBase.properties,
    tag: {type: new LiteralType<FsNodeType.File>({type: $FsNodeType, value: FsNodeType.File})},
    size: {type: new IntegerType()},
  },
  changeCase: CaseStyle.SnakeCase,
}));
