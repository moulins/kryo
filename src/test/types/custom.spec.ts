import { Incident } from "incident";
import { WrongTypeError } from "../../lib/errors";
import { Serializer } from "../../lib/types";
import { CustomType } from "../../lib/types/custom";
import { runTests, TypedValue } from "../helpers/test";

describe("Custom", function () {
  /**
   * Represents a complex number.
   * It only deals with complex number with small unsigned integer cartesian components for
   * simplicity.
   */
  class Complex {
    readonly real: number;
    readonly imaginary: number;

    constructor(real: number, imaginary: number) {
      this.real = real;
      this.imaginary = imaginary;
      Object.freeze(this);
    }

    static fromString(input: string): Complex {
      const realMatch: RegExpExecArray | null = /^(\d+)(?:\s*\+\s*\d+j)?$/.exec(input);
      const imaginaryMatch: RegExpExecArray | null = /^(?:\d+\s*\+\s*)?(\d+)j$/.exec(input);
      if (realMatch === null && imaginaryMatch === null) {
        throw new Incident("InvalidInput", {input});
      }
      const real: number = realMatch !== null ? parseInt(realMatch[1], 10) : 0;
      const imaginary: number = imaginaryMatch !== null ? parseInt(imaginaryMatch[1], 10) : 0;
      return new Complex(real, imaginary);
    }

    toString(): string {
      const parts: string[] = [];
      if (this.real !== 0) {
        parts.push(this.real.toString(10));
      }
      if (this.imaginary !== 0) {
        parts.push(`${this.imaginary.toString(10)}j`);
      }
      // tslint:disable-next-line:strict-boolean-expressions
      return parts.join(" + ") || "0";
    }
  }

  const complexType: CustomType<Complex> = new CustomType({
    read(input: any, serializer: Serializer): Complex {
      return Complex.fromString(input);
    },
    write(value: Complex, serializer: Serializer): string {
      return value.toString();
    },
    testError(value: Complex): Error | undefined {
      if (!(value instanceof Complex)) {
        return WrongTypeError.create("Complex", value);
      }
      return undefined;
    },
    equals(value1: Complex, value2: Complex): boolean {
      return value1.real === value2.real && value1.imaginary === value2.imaginary;
    },
    clone(value: Complex): Complex {
      return new Complex(value.real, value.imaginary);
    },
  });

  const items: TypedValue[] = [
    {
      name: "Complex {real: 0, imaginary: 0}",
      value: new Complex(0, 0),
      valid: true,
      output: {
        bson: "0",
        json: "0",
        qs: "0",
      },
    },
    {
      name: "Complex {real: 1, imaginary: 0}",
      value: new Complex(1, 0),
      valid: true,
      output: {
        bson: "1",
        json: "1",
        qs: "1",
      },
    },
    {
      name: "Complex {real: 0, imaginary: 2}",
      value: new Complex(0, 2),
      valid: true,
      output: {
        bson: "2j",
        json: "2j",
        qs: "2j",
      },
    },
    {
      name: "Complex {real: 3, imaginary: 4}",
      value: new Complex(3, 4),
      valid: true,
      output: {
        bson: "3 + 4j",
        json: "3 + 4j",
        qs: "3 + 4j",
      },
    },
    {name: "\"foo\"", value: "bar", valid: false},
    {name: "0", value: 0, valid: false},
    {name: "1", value: 1, valid: false},
    {name: "\"\"", value: "", valid: false},
    {name: "\"0\"", value: "0", valid: false},
    {name: "true", value: true, valid: false},
    {name: "false", value: false, valid: false},
    {name: "Infinity", value: Infinity, valid: false},
    {name: "-Infinity", value: -Infinity, valid: false},
    {name: "new Date(\"1247-05-18T19:40:08.418Z\")", value: new Date("1247-05-18T19:40:08.418Z"), valid: false},
    {name: "NaN", value: NaN, valid: false},
    {name: "undefined", value: undefined, valid: false},
    {name: "null", value: null, valid: false},
    {name: "[]", value: [], valid: false},
    {name: "{}", value: {}, valid: false},
    {name: "/regex/", value: /regex/, valid: false},
  ];

  runTests(complexType, items);
});
