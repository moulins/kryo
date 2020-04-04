/**
 * @module kryo/readers/qs
 */

import _qs from "qs";

import { Reader, ReadVisitor } from "../core.js";
import { QsValueReader } from "./qs-value.js";

export class QsReader implements Reader<string> {
  trustInput?: boolean | undefined;

  private readonly qs: typeof _qs;

  private readonly valueReader: QsValueReader;

  private readonly primitiveWrapper: string;

  constructor(qs: typeof _qs, trust?: boolean, primitiveWrapper: string = "_") {
    this.qs = qs;
    this.trustInput = trust;
    this.primitiveWrapper = primitiveWrapper;
    this.valueReader = new QsValueReader(trust);
  }

  readAny<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readAny(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readBoolean<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBoolean(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readBytes<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readBytes(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readDate<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDate(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readDocument<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readDocument(this.qs.parse(raw), visitor);
  }

  readFloat64<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readFloat64(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readList<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readList(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readMap<R>(raw: any, visitor: ReadVisitor<R>): R {
    return this.valueReader.readMap(this.qs.parse(raw), visitor);
  }

  readNull<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readNull(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }

  readString<R>(raw: string, visitor: ReadVisitor<R>): R {
    return this.valueReader.readString(this.qs.parse(raw)[this.primitiveWrapper], visitor);
  }
}
