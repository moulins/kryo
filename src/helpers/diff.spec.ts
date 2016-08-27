import {assert} from "chai";
import {diffSync} from "./diff";

describe("Diff", function () {
  it("Should support empty sequences", function () {
    let foo = diffSync("rosethyswode", "raisettacord");
    console.log("end");
    console.log(foo);
  });
});
