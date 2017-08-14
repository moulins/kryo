import {CaseStyle} from "../../../lib/_helpers/rename";
import {SimpleEnumType} from "../../../lib/simple-enum";

export enum FsNodeType {
  File,
  Directory,
}

export const $FsNodeType: SimpleEnumType<FsNodeType> = new SimpleEnumType<FsNodeType>({
  enum: FsNodeType,
  rename: CaseStyle.KebabCase,
});
