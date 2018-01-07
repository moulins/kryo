import { CaseStyle } from "../../../lib/case-style";
import { SimpleEnumType } from "../../../lib/types/simple-enum";

export enum FsNodeType {
  File,
  Directory,
}

export const $FsNodeType: SimpleEnumType<FsNodeType> = new SimpleEnumType<FsNodeType>({
  enum: FsNodeType,
  rename: CaseStyle.KebabCase,
});
