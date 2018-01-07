import { diffSets, DiffSetsResult } from "../_helpers/diff-sets";
import { ExtraKeysError } from "../errors/extra-keys";
import { MissingKeysError } from "../errors/missing-keys";
import { Serializer } from "../serializer";
import { DocumentType, name as typeName } from "../types/document";

export function register(serializer: Serializer): void {
  function write<T extends {}>(type: DocumentType<T>, val: T): {[key: string]: any} {
    const keysDiff: DiffSetsResult<string> = diffSets(type.keys.keys(), Object.keys(val));
    const result: {[key: string]: any} = {};
    for (const key of keysDiff.commonKeys) {
      if ((<any> val)[key] === undefined && type.properties[key].optional) {
        continue;
      }
      const outKey: string = type.keys.get(key)!;
      result[outKey] = serializer.write(type.properties[key].type, (<any> val)[key]);
    }
    return result;
  }

  function read<T>(type: DocumentType<T>, input: {[key: string]: any}): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(type.outKeys.keys(), Object.keys(input));
    const missingRequiredKeys: string[] = [...outKeysDiff.missingKeys].filter((outKey: string): boolean => {
      return !type.properties[type.outKeys.get(outKey)!].optional;
    });
    if (missingRequiredKeys.length > 0) {
      throw MissingKeysError.create(missingRequiredKeys);
    } else if (outKeysDiff.extraKeys.size > 0 && !type.ignoreExtraKeys) {
      throw ExtraKeysError.create([...outKeysDiff.extraKeys]);
    }

    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = type.outKeys.get(outKey)!;
      result[key] = serializer.read(type.properties[key].type, input[outKey]);
    }
    return result as T;
  }

  function readTrusted<T>(type: DocumentType<T>, input: {[key: string]: any}): T {
    const outKeysDiff: DiffSetsResult<string> = diffSets(type.outKeys.keys(), Object.keys(input));
    // TODO(demurgos): use Partial<T> once typedoc supports it
    const result: any = {};
    for (const outKey of outKeysDiff.commonKeys) {
      const key: string = type.outKeys.get(outKey)!;
      result[key] = serializer.readTrusted(type.properties[key].type, input[outKey]);
    }
    return result as T;
  }

  serializer.register({
    typeName,
    write,
    read,
    readTrusted,
  });
}
