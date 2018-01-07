import { CaseStyle } from "../../../lib/case-style";
import { DocumentType } from "../../../lib/types/document";
import { Ucs2StringType } from "../../../lib/types/ucs2-string";
import { $FsNodeType, FsNodeType } from "./fs-node-type";

export interface FsNodeBase {
  type: FsNodeType;
  name: string;
}

export const $FsNodeBase: DocumentType<FsNodeBase> = new DocumentType<FsNodeBase>({
  properties: {
    type: {type: $FsNodeType},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
  },
  rename: CaseStyle.SnakeCase,
});
