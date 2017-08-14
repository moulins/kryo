import {runTests, TypedValue} from "../../helpers/test";
import {$File} from "./file";
import {FsNodeType} from "./fs-node-type";

/**
 * Modelizes a simple file system with two kinds of nodes: files and directories.
 */
describe("FS Node", function () {
  const items: TypedValue[] = [
    {value: {type: FsNodeType.File, name: "a", size: 1}, valid: true},
    {value: {type: FsNodeType.File, name: 2, size: 1}, valid: false},
  ];

  runTests($File, items);
});
