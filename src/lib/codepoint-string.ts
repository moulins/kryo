import { Incident } from "incident";
import { checkedUcs2Decode } from "./_helpers/checked-ucs2-decode";
import { lazyProperties } from "./_helpers/lazy-properties";
import { LowerCaseError } from "./errors/lower-case";
import { MaxCodepointsError } from "./errors/max-codepoints";
import { MinCodepointsError } from "./errors/min-codepoints";
import { MissingDependencyError } from "./errors/missing-dependency";
import { NotTrimmedError } from "./errors/not-trimmed";
import { PatternNotMatchedError } from "./errors/pattern-not-matched";
import { WrongTypeError } from "./errors/wrong-type";
import { Lazy, VersionedType } from "./types";

let unormNfc: ((str: string) => string) | undefined = undefined;
try {
  /* tslint:disable-next-line:no-var-requires no-require-imports */
  unormNfc = require("unorm").nfc;
} catch (err) {
  // Ignore dependency not found error.
}

export enum Normalization {
  None,
  Nfc,
}

export type Name = "codepoint-string";
export const name: Name = "codepoint-string";
export type T = string;
export namespace json {
  export type Input = string;
  export type Output = string;

  export interface Type {
    name: Name;
    normalization: "none" | "nfc";
    enforceUnicodeRegExp: boolean;
    pattern?: [string, string];
    lowerCase: boolean;
    /**
     * @see [[Ucs2StringOptions.trimmed]]
     */
    trimmed: boolean;
    minCodepoints?: number;
    maxCodepoints: number;
  }
}
export type Diff = [string, string];

export interface Options {
  /**
   * Ensure NFC normalization when reading strings.
   *
   * References:
   * - http://unicode.org/faq/normalization.html
   * - http://unicode.org/reports/tr15/
   */
  normalization?: Normalization;

  enforceUnicodeRegExp?: boolean;
  pattern?: RegExp;
  lowerCase?: boolean;

  /**
   * The string cannot start or end with any of the following whitespace and line terminator
   * characters:
   *
   * - Unicode Character 'CHARACTER TABULATION' (U+0009)
   * - Unicode Character 'LINE FEED (LF)' (U+000A)
   * - Unicode Character 'LINE TABULATION' (U+000B)
   * - Unicode Character 'FORM FEED (FF)' (U+000C)
   * - Unicode Character 'CARRIAGE RETURN (CR)' (U+000D)
   * - Unicode Character 'SPACE' (U+0020)
   * - Unicode Character 'NO-BREAK SPACE' (U+00A0)
   * - Unicode Character 'LINE SEPARATOR' (U+2028)
   * - Unicode Character 'PARAGRAPH SEPARATOR' (U+2029)
   * - Unicode Character 'ZERO WIDTH NO-BREAK SPACE' (U+FEFF)
   * - Any other Unicode character of the "Separator, space" (Zs) general category
   *
   * @see <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim>
   * @see <http://www.fileformat.info/info/unicode/category/Zs/list.htm>
   */
  trimmed?: boolean;
  minCodepoints?: number;
  maxCodepoints: number;
}

export class CodepointStringType implements VersionedType<T, json.Input, json.Output, Diff> {

  readonly name: Name = name;
  readonly normalization: Normalization;
  readonly enforceUnicodeRegExp: boolean;
  readonly pattern?: RegExp;
  readonly lowerCase: boolean; // TODO(demurgos): Rename to enforceLowerCase
  readonly trimmed: boolean; // TODO(demurgos): Rename to enforceTrimmed
  readonly minCodepoints?: number;
  readonly maxCodepoints: number;

  private _options: Lazy<Options>;

  constructor(options: Lazy<Options>, lazy?: boolean) {
    this._options = options;
    if (lazy === undefined) {
      lazy = typeof options === "function";
    }
    if (!lazy) {
      this._applyOptions();
    } else {
      lazyProperties(
        this,
        this._applyOptions,
        ["normalization", "enforceUnicodeRegExp", "pattern", "lowerCase", "trimmed", "minCodepoints", "maxCodepoints"],
      );
    }
  }

  static fromJSON(options: json.Type): CodepointStringType {
    const resolvedOptions: Options = {
      normalization: options.normalization === "none" ? Normalization.None : Normalization.Nfc,
      enforceUnicodeRegExp: options.enforceUnicodeRegExp,
      lowerCase: options.lowerCase,
      trimmed: options.trimmed,
      maxCodepoints: options.maxCodepoints,
    };
    if (options.pattern !== undefined) {
      resolvedOptions.pattern = new RegExp(options.pattern[0], options.pattern[1]);
    }
    if (options.minCodepoints !== undefined) {
      resolvedOptions.minCodepoints = options.minCodepoints;
    }
    return new CodepointStringType(resolvedOptions);
  }

  toJSON(): json.Type {
    const jsonType: json.Type = {
      name,
      normalization: this.normalization === Normalization.None ? "none" : "nfc",
      enforceUnicodeRegExp: this.enforceUnicodeRegExp,
      lowerCase: this.lowerCase,
      trimmed: this.trimmed,
      maxCodepoints: this.maxCodepoints,
    };
    if (this.pattern !== undefined) {
      jsonType.pattern = [this.pattern.source, this.pattern.flags];
    }
    if (this.minCodepoints !== undefined) {
      jsonType.minCodepoints = this.minCodepoints;
    }
    return jsonType;
  }

  readTrustedJson(input: json.Output): T {
    return input;
  }

  readJson(input: any): T {
    const error: Error | undefined = this.testError(input);
    if (error !== undefined) {
      throw error;
    }
    return input;
  }

  writeJson(val: T): json.Output {
    return val;
  }

  testError(val: T): Error | undefined {
    if (!(typeof val === "string")) {
      return WrongTypeError.create("string", val);
    }

    switch (this.normalization) {
      case Normalization.Nfc:
        if (unormNfc === undefined) {
          throw MissingDependencyError.create("unorm", "Required to normalize unicode strings to NFC.");
        }
        if (val !== unormNfc(val)) {
          return Incident("UnicodeNormalization", "Not NFC-Normalized");
        }
        break;
      case Normalization.None:
        break;
      default:
        throw new Incident(
          `IncompleteSwitch: Received unexpected variant for this.normalization: ${this.normalization}`,
        );
    }

    if (this.lowerCase && val !== val.toLowerCase()) {
      return LowerCaseError.create(val);
    }

    if (this.trimmed && val !== val.trim()) {
      return NotTrimmedError.create(val);
    }

    let codepointCount: number;
    try {
      codepointCount = checkedUcs2Decode(val).length;
    } catch (err) {
      return err;
    }

    const minCodepoints: number | undefined = this.minCodepoints;
    if (typeof minCodepoints === "number" && codepointCount < minCodepoints) {
      return MinCodepointsError.create(val, codepointCount, minCodepoints);
    }

    if (codepointCount > this.maxCodepoints) {
      return MaxCodepointsError.create(val, codepointCount, this.maxCodepoints);
    }

    if (this.pattern instanceof RegExp) {
      if (!this.pattern.unicode && this.enforceUnicodeRegExp) {
        throw new Incident(
          "NonUnicodeRegExp",
          "Enforced unicode RegExp, use `enforceUnicodeRegExp = false` or `Ucs2StringType`",
        );
      }

      if (!this.pattern.test(val)) {
        return PatternNotMatchedError.create(this.pattern, val);
      }
    }

    return undefined;
  }

  test(val: T): boolean {
    return this.testError(val) === undefined;
  }

  equals(val1: T, val2: T): boolean {
    return val1 === val2;
  }

  clone(val: T): T {
    return val;
  }

  diff(oldVal: T, newVal: T): Diff | undefined {
    return oldVal === newVal ? undefined : [oldVal, newVal];
  }

  patch(oldVal: T, diff: Diff | undefined): T {
    return diff === undefined ? oldVal : diff[1];
  }

  reverseDiff(diff: Diff | undefined): Diff | undefined {
    return diff === undefined ? undefined : [diff[1], diff[0]];
  }

  squash(diff1: Diff | undefined, diff2: Diff | undefined): Diff | undefined {
    if (diff1 === undefined) {
      return diff2 === undefined ? undefined : [diff2[0], diff2[1]];
    } else if (diff2 === undefined) {
      return [diff1[0], diff1[1]];
    }
    return diff1[0] === diff2[1] ? undefined : [diff1[0], diff2[1]];
  }

  private _applyOptions(): void {
    if (this._options === undefined) {
      throw new Incident("No pending options");
    }
    const options: Options = typeof this._options === "function" ? this._options() : this._options;

    const normalization: Normalization = options.normalization !== undefined ?
      options.normalization :
      Normalization.Nfc;
    const enforceUnicodeRegExp: boolean = options.enforceUnicodeRegExp !== undefined ?
      options.enforceUnicodeRegExp :
      true;
    const pattern: RegExp | undefined = options.pattern;
    const lowerCase: boolean = options.lowerCase !== undefined ? options.lowerCase : false;
    const trimmed: boolean = options.trimmed !== undefined ? options.trimmed : false;
    const minCodepoints: number | undefined = options.minCodepoints;
    const maxCodepoints: number = options.maxCodepoints;

    Object.assign(
      this,
      {normalization, enforceUnicodeRegExp, pattern, lowerCase, trimmed, minCodepoints, maxCodepoints},
    );
    Object.freeze(this);
  }
}

export { CodepointStringType as Type };
