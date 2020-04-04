# Kryo

[![npm](https://img.shields.io/npm/v/kryo.svg)](https://www.npmjs.com/package/kryo)
[![GitHub repository](https://img.shields.io/badge/Github-demurgos%2Fkryo-blue.svg)](https://github.com/demurgos/kryo)
[![Build status](https://img.shields.io/travis/com/demurgos/kryo/master.svg)](https://travis-ci.com/demurgos/kryo)
[![Codecov](https://codecov.io/gh/demurgos/kryo/branch/master/graph/badge.svg)](https://codecov.io/gh/demurgos/kryo)

[Documentation](https://demurgos.github.io/kryo/)

## Introduction

Kryo is a library to represent data types at runtime. For example, it lets you test if a value
matches a type or safely serialize data between various formats such as `JSON` or `BSON`.

Here are other examples of problems that Kryo was written to solve:

- The public functions of your library check the validity of their arguments (arguments are not
  trusted). Having runtime types allows this verification to be explicit and easier to maintain.

- Deserializing the JSON string `'{createdAt: "2017-10-15T17:10:08.218Z"}'` requires type
  information to convert the value to a `Date` instance: Kryo simplifies it so you don't have to
  manually handle type conversions.

- The convention in Javascript/Typescript is to use `camelCase` for property names but you consume
  serialized data (like `JSON`) with `snake_case` and don't want to manually maintain name
  rewrites.

## Installation

You can install the latest stable version of Kryo with _yarn_ (recommended) or _npm_:

```shell
# Using yarn:
yarn add kryo
# Usin npm:
npm install --save kryo
```

The package includes Typescript type defintion files (`.d.ts`) and source maps.

You can install the preview of the next version. This version is continuously deployed from the
`master` branch of the repo (it is the most up-to-date version).

```
yarn add kryo@next
npm install --save kryp@next
```

## Getting started

**Note: The documentation is in the process of being rewritten. Some sections are drafts or
outdated.**

### Types

A Kryo **Type** represents a set of valid values. Kryo provides you multiple builtin types and
utilities to easily create your own types.

It is simply an object with 3 methods to:
- test if a value is valid (`.test`)
- check if two valid values are equivalent (`.equals`)
- create a deep copy of a valid value (`.clone`)

If you like fancy words, it defines a [setoid](https://en.wikipedia.org/wiki/Setoid).

There are more advanced types with additional methods and operators (for example to support
serialization) but any object implementing [the `Type` interface](https://demurgos.github.io/kryo/interfaces/_types_.type.html)
is compatible with Kryo. 

For example, the builtin type `$Uint8` represents an unsigned integer in the inclusive range
`[0, 255]`.

```typescript
import { $Uint8 } from "kryo/builtins/uint8";

$Uint8.test(15); // `true`
$Uint8.test(Math.PI); // `false`
$Uint8.test("Hello, World!"); // `false`
$Uint8.equals(6, 6); // `true`
$Uint8.clone(255); // `255`
```

### Type constructors

Kryo provides **type constructors** for common types. They let you instanciate types using a
configuration object.

For example you may want to define a `$Percentage` type representing unsigned integers in the
inclusive range `[0, 100]`. You can implement it from scratch, or use the `IntegerType` type
constructor.

```typescript
import { IntegerType } from "kryo/types/integer";

const $Percentage = new IntegerType({min: 0, max: 100});
// You can also define `$Uint8` yourself
const $Uint8 = new IntegerType({min: 0, max: 255});

$Percentage.test(50); // `true`
$Percentage.test(101); // `false`
```

#### DocumentType

One of the most important type constructors is `DocumentType`. It lets you describe the interface
of Javascript objects by composing types for each property.

```typescript
import { DocumentType } from "kryo/types/document";
import { Ucs2StringType } from "kryo/types/ucs2-string";

const $DisplayName = new Ucs2StringType({maxLength: 32});

/**
 * Typescript interface describing our values: a user id
 * an optional (can be undefined) display name.
 */
interface User {
  id: number;
  displayName?: string;
}

const $PriceTag = new DocumentType<PriceTag>({
  properties: {
    id: {type: $Uint8},
    displayName: {type: $DisplayName, optional: true},
  }
});
```

#### TaggedUnionType

One of the most powerful type constructors provided by Kryo is `TaggedUnionType`. It allows to
combine multiple document types and differentiate them using the value of a "tag" property. This
property must describe Typescript-like enum: each document type is associated with a distinct
value of the enum.
This is the analogue of Typescript's discriminated unions.

For example, Github's repository owners can either be users or organizations. We can define it
as follow:

```typescript
// 1. We create an enum used to differentiate the possible values.
enum RepositoryOwnerType {
  User = "user",
  Organization = "organization",
}
const $RepositoryOwnerType = new TsEnumType({enum: RepositoryOwnerType});

// 2. We define the User document
interface User {
  type: RepositoryOwnerType.User;
  id: number;
  username: string;
}
const $User = new DocumentType({
  properties: {
    type: {type: new LiteralType({itemType: $RepositoryOwnerType, value: RepositoryOwnerType.User})},
    id: {type: $Uint32},
    username: {type: $Username},
  }
});

// 3. We define the Organization document
interface Organization {
  type: RepositoryOwnerType.Organization;
  id: number;
  members: any[];
}
const $Organization = new DocumentType({
  properties: {
    type: {type: new LiteralType({itemType: $RepositoryOwnerType, value: RepositoryOwnerType.Organization})},
    id: {type: $Uint32},
    members: {type: new ArrayType({itemType: $Any})},
  }
});

// 4. We create the union type
type RepositoryOwner = User | Organization;
const $RepositoryOwner = new TaggedUnionType({variants: [User, Organization], tag: "type"});
```

---

You can define custom types, for example we can define a `Prime` type describing prime numbers.

```typescript
// By convention, the names of type objects are prefixed by `$`
const $Prime: Type<number> = {
  testError(value: number): Error | undefined {
    if (typeof value !== "number") {
      // Notice the error is returned and not thrown:
      // this is not a logic problem but an expected error.
      return new Error("Expected `number`");
    }
    if (value <= 1 || Math.floor(value) !== value) {
      return new Error("Expected a positive integer strictly greater than 1");
    }
    for (let divisor: number = 2; divisor <= Math.sqrt(value); divisor++) {
      if (value % divisor === 0) {
        return new Error(`Divisible by ${divisor}`);
      }
    }
    return undefined; // No error
  },
  test(value: number): boolean {
    return this.testError(value) === undefined;
    // You can either reuse `testError` as above or provide a new implementation without error messages:
    // ```typescript
    // if (typeof value !== "number" || value <= 1 || Math.floor(value) !== value) {
    //   return false;
    // }
    // for (let divisor: number = 2; divisor <= Math.sqrt(value); divisor++) {
    //   if (value % divisor === 0) {
    //     return false;
    //   }
    // }
    // return true;
    // ```
  },
  equal(left: number, right: number): boolean {
    return left === right;
  },
  clone(value: number): number {
    return value;
  },
}
```

You can already use your type (`$Prime.test(7)` for example) but Kryo helps you to create common
types with its type constructors and then compose these types to describe more advanced structures.

Suppose that we are building a database of prime numbers: each record is a number with its
discovery date. We can use the provided `DocumentType` constructor to create our record type
from `$Prime` and the builtin `$Date` type:

```typescript
import { $Date } from "kryo/builtins/date";
import { DocumentType } from "kryo/types/document";

const $Record = new DocumentType({
  properties: {
    discoveryDate: {type: $Date},
    value: {type: $Prime},
  }
});

$Record.test({}); // `false` (missing required properties)
$Record.test({discoveryDate: new Date(), value: 10}); // `false` (not a prime)
$Record.test({discoveryDate: null, value: 10}); // `false` (invalid value for `discoveryDate`)
$Record.test({discoveryDate: new Date(), value: 11}); // `true`
```

`$Date` and instances of `DocumentType` implement not only the `Type` interface but also the
`IoType` interface: they support serialization.

The `IoType` interface has two additional methods:

```typescript
interface IoType {
  write<W>(writer: Writer<W>, value: T): W;
  read<R>(reader: Reader<R>, raw: R): T;
}
```

The signature is more complex but it lets you write a single serialization and deserialization
method to handle most general-pupose formats: the format details are abstracted by the `writer`
and `reader` objects.

```typescript
const $Prime: IoType<number> = {
  testError(value: number): Error | undefined { ... },
  test(value: number): boolean { ... },
  equal(left: number, right: number): boolean { ... },
  clone(value: number): number { ... },
  write<W>(writer: Writer<W>, value: number): W {
    return writer.writeFloat64(value);
  },
  read<R>(reader: Reader<R>, raw: R): number {
    return reader.readFloat64(raw, readVisitor({
      fromFloat64: (input: number): number => {
        const error: Error | undefined = reader.trustInput ? undefined : this.testError(input);
        if (error !== undefined) { throw error; }
        return input;
      },
    }));
  },
}
```

The reader and writer objects use an intermediate model for types: rich enough to represent the
types of most popular general-purpose languages but simpler than the runtime types.

**TODO**: Serialization needs way more explanations.

Now that all of our objects support serialization, we can use it to read to and from JSON despite
the `Date` type (used by `discoveryDate` but not supported by JSON):

```typescript
const reader: JsonReader = new JsonReader();
const writer: JsonReader = new JsonWriter();

const record = $Record.read(reader, '{"discoveryDate": "2017-10-15T17:10:08.218Z", value: 5}');
// Notice that the Date type is not supported by JSON but we properly deserialized it thanks to the
// runtime description:
console.log(record.discoveryDate instanceof Date); // `true`
const record.value = 11;
console.log($Record.write(writer, record)); // `'{"discoveryDate": "2017-10-15T17:10:08.218Z", value: 11}'`
```

### Types

**THE DOCUMENTATION IS IN THE PROCESS OF BEING REWRITTEN, THIS SECTION IS OUTDATED**

Kryo differentiates three level of types.
- The simplest types only guarantee support for runtime values: test if the value match the type, clone values,
  perform equality tests.
- Serializable types extend simple types by adding support for conversions between the runtime and serializable
  representation of values of the provided type. The currently supported formats are JSON, BSON and query strings
  (as parsed by the `qs` library).
- Versioned types further extend serializable types by adding support for comparison between multiple values
  of the type to produce diffs. These diffs can then be used to convert one value to the other.

You can import all the types from the main module, but it is recommended to import them them directly from
their module (to allow better dead-code elimination):

```typescript
import { Ucs2StringType } from "kryo/types/ucs2-string";
import { DateType } from "kryo/types/date";

// Use the type constructor to create a specialized string
const $Identifier: Ucs2StringType = new Ucs2StringType({minLength: 1, maxLength: Infinity, pattern: /[_a-zA-Z][_a-zA-Z0-9]/});
// Instantiate the date type, see next section to use a builtin instead of creating a new instance
const $Date: DateType = new DateType();

// Both $identifier and $date are versioned type: they implement the methods of all the levels.

// Use the methods provided by simple type 
$Identifier.test("abc"); // true
$Identifier.test("$#!+"); // false
$Date.testError(NaN); 
const now: Date = new Date();
const nowCopy = $Date.clone(now);
console.log(now === nowCopy); // false: `clone` performs a deep copy on objects
$Date.equals(now, nowCopy); // Tests the "equivalence" of the values: it's not the same object but they hold the same value

// Use the methods provided by serializable types
$Date.write("json", now); // Returns the ISO string "2017-10-15T17:10:08.218Z"
$Date.read("json", "2017-10-15T17:10:08.218Z"); // Returns a `Date` instance
$Identifier.read("json", "$#!+"); // Throws error: you can use Kryo to read untrusted input and validate it
$Date.readTrusted("json", "2017-10-15T17:10:08.218Z"); // If you know what you are doing, you can only perform conversion and ignore validation

// Use the methods provided by versionned types
const diff1: number | undefined = $Date.diff(now, nowCopy); // undefined: both are equal
const diff2: number | undefined = $Date.diff(new Date(10), new Date(30)); // 20: the diff of `DateType` is the difference in ms
const diff3: number | undefined = $Date.diff(new Date(30), new Date(60)); // 30
const diff4: [string, string] | undefined = $Identifier.diff("foo", "bar"); // ["foo", "bar"], strings return a simple [old, new] tuple
$Date.patch(new Date(10), diff2); // applies the diff: returns a value equivalent to `new Date(30)`
$Date.squash(diff2, diff3); // 50: merge the two diffs in a single diff representing the whole change
$Date.reverseDiff(diff3); // -30: Diffs are symetric: you can always reverse them
$Date.patch($Date.reverseDiff(diff3)); // 30: Apply the reverse diff to retrieve `30` from `60`
```

### Type constructors and builtins

**THE DOCUMENTATION IS IN THE PROCESS OF BEING REWRITTEN, THIS SECTION IS OUTDATED**

Kryo provides both constructors to let you instantiate types by providing a minimal configuration but also builtins
for common types. By convention, the names of actual types start with `$` while the names of type constructors end
with `Type`.

Example: Kryo provides the class `IntegerType` to produce types for integers in a given range. Kryo also provide
the built-in `$Uint32` type: an instance of `IntegerType` already configured for the common range of unsigned
32-bit integers (`[0, 2**32 - 1]`).

```typescript
import { IntegerType } from "kryo/types/integer";
import { $Uint32 } from "kryo/builtins/uint32";

/** Represents the type of the outcome of throwing two D6 dices and summing their value */
const $twoDicesOutcome: Type<number> = new IntegerType({min: 2, max: 36});
$twoDicesOutcome.test(6); // true
$twoDicesOutcome.test("three"); // false
$twoDicesOutcome.test(NaN); // false
$twoDicesOutcome.test(1); // false

// You can directly use `$Uint32`, no need to configure / instantiate it:
$Uint32.test(1); // true
$Uint32.test(1.5); // false
$Uint32.test(2 ** 32); // false
$Uint32.test(2 ** 32 - 1); // true
```

### Types

**THE DOCUMENTATION IS IN THE PROCESS OF BEING REWRITTEN, THIS SECTION IS OUTDATED**

Kryo currently provide support for the following types:

- Null: Represents the single the value `null`
- Boolean: `true` or `false`
- Integer: Integers in a given range
- Float: Finite or infinite floats
- Date: Point in times
- Buffer: Arrays of bytes
- Ucs2String: Javascript strings of UCS2 code units, with patterns, case folding, length checks, ...
- CodepointString: Strings of unicode codepoints, with normalization, support for surrogate pairs and unicode-aware
  patterns, length checks, etc.
- Json: Opaque value safe with regard to JSON serialization and deserialization.
- Enum: Represents Typescript enums
- Literal type: Represents a single value, useful for unions.
- Union: Represents sum types to support multiple alternatives (ex. "integer or string"). Multiple implementations
  are provided, mainly to better deal with deserialization and errors: whitelists, try-unions, tagged unions.
- Array: Ordered collection of items
- Map: Unbounded collection of same-type (key, value) pairs
- Document: Finite collection of mixed values identified by their string key.

It is also fully compatible with your own type if you implement the correct interface.

Please check the documentation of each type to see that options are available and which builtins are provided
out of the box.

Here is an example to define the type of a point in a RGBa color-space with 8-bit depth:

```typescript
import {$Uint8} from "kryo/integer";

```

### Circular definitions, lazy options

**THE DOCUMENTATION IS IN THE PROCESS OF BEING REWRITTEN, THIS SECTION IS OUTDATED**

Kryo supports circular type definitions, this allows to describe recursive values such as trees.
Note that circular values are not supported (yet) by Kryo: you have to break and recreate the cycles in the values yourself.

Here is an example of values with a recursive structure:
```typescript
const v0 = {}
const v1 = {foo: {}}
const v2 = {foo: {bar: {}}}
const v3 = {foo: {bar: {foo: {}}}}
const v4 = {foo: {bar: {foo: {bar: {}}}}}
```

At each level, the value is a document with an optional key alternating between `foo` and `bar`.
The value is not circular, but we see that to describe it we need the types to be self-referential.

A simple (invalid) approach would be to define it as follow:
```typescript
// The document at each even level can have an optional key `foo` of type `$oddLevel`
const $evenLevel = new DocumentType({
  properties: {
    foo: {type: $oddLevel, optional: true},
  }
});

// This is the corresponding type for the documents at an odd depth
const $oddLevel = new DocumentType({
  properties: {
    bar: {type: $evenLevel, optional: true},
  }
});

$evenLevel.test(v4); // Error
```

The issue with the code above is that during the declaration of `$evenLevel`, `$oddLevel` is not yet defined so the
received properties object is `{foo: {type: undefined, optional: true}}`.
To solve this problem, Kryo's types use a simple trick: you can pass the options lazily. Instead of providing
the options object directly, you can use a function returning this function object. This function will be called
only once, but not at the creation of the instance but at its first use.

```typescript
// Note that the options were wrapped in a lambda
const $evenLevel = new DocumentType(() => ({
  properties: {
    foo: {type: $oddLevel, optional: true},
  }
}));

const $oddLevel = new DocumentType(() => ({
  properties: {
    bar: {type: $evenLevel, optional: true},
  }
}));

// At this point, both `$evenLevel` and `$oddLevel` is defined but none of the lambda were called
// because the types were not used: there were no attribute read or method call.

// When call a method for the first time, `$evenLevel` initializes itself by calling the lambda
// When testing `v4`, `$oddLevel` will also be used so it will be initialized at this point.
$evenLevel.test(v4); // Success: returns `true`
```

## License

[MIT License](./LICENSE.md)

