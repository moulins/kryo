/**
 * This is a placeholder module: you should never import it. Trying to import it will result in a
 * runtime error.
 *
 * Use deep module imports to directly import components you need.
 *
 * For example, to import the `DocumentType` type constructor, use:
 * ```typescript
 * import { DocumentType } from "kryo/types/document";
 * ```
 *
 * @module kryo
 */

import { Incident } from "incident";

throw new Incident(
  "IndexImport",
  // tslint:disable-next-line:max-line-length
  "You cannot import `kryo`'s index module, use deep imports such as `import { DocumentType } from \"kryo/types/document\"`.",
);
