import { TsEnumType } from "../../../lib/types/ts-enum";

export enum FsNodeType {
  File,
  Directory,
}

export const $FsNodeType: TsEnumType<FsNodeType> = new TsEnumType<FsNodeType>({
  tsEnum: FsNodeType,
  rename: {
    File: "Node/File",
    Directory: "Node/Directory",
  },
});
