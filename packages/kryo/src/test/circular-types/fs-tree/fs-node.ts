import { TaggedUnionType } from "../../../lib/types/tagged-union.js";
import { $Directory, Directory } from "./directory.js";
import { $File, File } from "./file.js";

export type FsNode =
  Directory
  | File;

export const $FsNode: TaggedUnionType<FsNode> = new TaggedUnionType<FsNode>(() => ({
  variants: [
    $Directory,
    $File,
  ],
  tag: "tag",
}));
