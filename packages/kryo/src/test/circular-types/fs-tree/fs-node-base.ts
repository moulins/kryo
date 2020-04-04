import { CaseStyle } from "../../../lib/case-style.js";
import { DocumentType } from "../../../lib/types/document.js";
import { Ucs2StringType } from "../../../lib/types/ucs2-string.js";
import { $FsNodeType, FsNodeType } from "./fs-node-type.js";

export interface FsNodeBase {
  tag: FsNodeType;
  name: string;
}

export const $FsNodeBase: DocumentType<FsNodeBase> = new DocumentType<FsNodeBase>({
  properties: {
    tag: {type: $FsNodeType},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  changeCase: CaseStyle.SnakeCase,
});
