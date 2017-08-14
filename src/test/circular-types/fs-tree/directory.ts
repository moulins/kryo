import {CaseStyle} from "../../../lib/_helpers/rename";
import {ArrayType} from "../../../lib/array";
import {DocumentType} from "../../../lib/document";
import {LiteralType} from "../../../lib/literal";
import {Ucs2StringType} from "../../../lib/ucs2-string";
import {$FsNode, FsNode} from "./fs-node";
import {FsNodeBase} from "./fs-node-base";
import {$FsNodeType, FsNodeType} from "./fs-node-type";

export interface Directory extends FsNodeBase {
  type: FsNodeType.Directory;
  children: FsNode[];
}

export const $Directory: DocumentType<Directory> = new DocumentType<Directory>({
  properties: {
    type: {type: new LiteralType({type: $FsNodeType, value: FsNodeType.Directory})},
    name: {type: new Ucs2StringType({maxLength: Infinity})},
    children: {type: new ArrayType({itemType: $FsNode, maxLength: Infinity}), optional: true},
  },
  rename: CaseStyle.SnakeCase,
});
