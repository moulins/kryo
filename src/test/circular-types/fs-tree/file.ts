import { CaseStyle } from "../../../lib/_helpers/rename";
import { DocumentType } from "../../../lib/document";
import { IntegerType } from "../../../lib/integer";
import { LiteralType } from "../../../lib/literal";
import { $FsNodeBase, FsNodeBase } from "./fs-node-base";
import { $FsNodeType, FsNodeType } from "./fs-node-type";

export interface File extends FsNodeBase {
  type: FsNodeType.File;
  size: number;
}

export const $File: DocumentType<File> = new DocumentType<File>({
  properties: {
    ...$FsNodeBase.properties,
    type: {type: new LiteralType({type: $FsNodeType, value: FsNodeType.File})},
    size: {type: new IntegerType()},
  },
  rename: CaseStyle.SnakeCase,
});
