// import {UnexpectedTypeError, ViaTypeError} from "./helpers/via-type-error";
// import * as Bluebird from "bluebird";
// import {TypeSync, TypeAsync} from "./interfaces";
//
// import * as numberType from "./number";
// import {NumberType} from "./number";
//
// const NAME = "integer";
//
// export interface NumberOptions {}
//
//
// function diffSync (oldVal: number, newVal: number, options?: NumberOptions): number | null {
//   return oldVal === newVal ? null : newVal - oldVal;
// }
//
// function patchSync (oldVal: number, diff: number | null, options?: NumberOptions): number {
//   return diff === null ? oldVal : oldVal + diff;
// }
//
// function reverseDiffSync (diff: number | null): number | null {
//   return diff === null ? null : -diff;
// }
//
// export class IntegerType implements
//   TypeSync<number, number, NumberOptions>,
//   TypeAsync<number, number, NumberOptions> {
//
//   isSync = true;
//   isAsync = true;
//   isCollection = true;
//   type = NAME;
//   types = [NAME];
//
//   numberType: NumberType = null;
//
//   constructor () {
//     this.numberType = new NumberType();
//   }
//
//   toJSON(): null {  // TODO: return options
//     return null;
//   }
//
//   readSync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): number {
//     const numVal = super.readSync(format, val, options);
//     if (Math.floor(numVal) !== numVal) {
//       throw new Error("Not an integer");
//     }
//     return numVal;
//   }
//
//   readAsync (format: "json-doc" | "bson-doc", val: any, options?: NumberOptions): Bluebird<number> {
//     return Bluebird.try(() => this.readSync(format, val, options));
//   }
//
//   testErrorSync (val: any, options?: NumberOptions): Error | null {
//     let err = super.testErrorSync(val, options);
//     if (err === null && Math.floor(val) !== val) {
//       err = new Error("Not an integer");
//     }
//     return err;
//   }
//
//   testErrorAsync (val: any, options?: NumberOptions): Bluebird<Error | null> {
//     return Bluebird.try(() => this.testErrorSync(val, options));
//   }
//
//   testSync (val: any, options?: NumberOptions): boolean {
//     return this.testErrorSync(val, options) === null;
//   }
//
//   testAsync (val: any, options?: NumberOptions): Bluebird<boolean> {
//     return Bluebird
//       .try(() => this.testErrorAsync(val, options))
//       .then((result) => result === null);
//   }
//
//   diffSync (oldVal: number, newVal: number, options?: NumberOptions): number | null {
//     return diffSync(oldVal, newVal, options);
//   }
//
//   diffAsync (oldVal: number, newVal: number, options?: NumberOptions): Bluebird<number | null> {
//     return Bluebird.try(() =>  diffSync(oldVal, newVal, options));
//   }
//
//   patchSync (oldVal: number, diff: number | null, options?: NumberOptions): number {
//     return patchSync(oldVal, diff, options);
//   }
//
//   patchAsync (oldVal: number, diff: number | null, options?: NumberOptions): Bluebird<number> {
//     return Bluebird.try(() => patchSync(oldVal, diff, options));
//   }
// }
//
// export class NumberTypeError extends ViaTypeError {}
//
// export class NumericError extends NumberTypeError {
//   constructor (value: number) {
//     super (null, "NumericError", {value: value}, "Value is not a number")
//   }
// }
