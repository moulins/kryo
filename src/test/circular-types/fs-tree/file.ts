import {CaseStyle} from "../../../lib/_helpers/rename";
import {DocumentType} from "../../../lib/document";
import {IntegerType} from "../../../lib/integer";
import {LiteralType} from "../../../lib/literal";
import {Ucs2StringType} from "../../../lib/ucs2-string";
import {FsNodeBase} from "./fs-node-base";
import {$FsNodeType, FsNodeType} from "./fs-node-type";

export interface File extends FsNodeBase {
  type: FsNodeType.File;
  size: number;
}

export const $File: DocumentType<File> = new DocumentType<File>({
  properties: {
    type: {type: new LiteralType({type: $FsNodeType, value: FsNodeType.File})},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
    size: {type: new IntegerType()},
  },
  rename: CaseStyle.SnakeCase,
});
