/**
 * PHP specific language parser
 */

'use strict';

import { Parser } from '../parser';

export class PHP extends Parser {
  /**
   * Constructs settings specific to PHP
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: 'a-zA-Z0-9_$\x7f-\xff',
        modifiers: ['public', 'static', 'protected', 'private'],
        types: ['self', 'array', 'callable', 'bool', 'boolean', 'float', 'int',
          'integer', 'string', 'iterable'],
      },
    });

    this.languageId = 'php';
  }

  /**
   * Converts nullable type to union type (e.g. `type|null`). If type is not
   * nullable, return given type
   *
   * @param   {string}  type  Type to convert
   *
   * @return  {string}        Union docblock type, or original type if not
   *                          nullable
   */
  protected formatNullable(type: string): string {
    let result = type;

    // Expression to check if the given type is nullable by checking for the
    // occurrence of a leading '?' character
    const nullable = /^\?/;
    if (nullable.test(type)) {
      // Determine whether to return union type or simply "mixed"
      if (this.config.get('phpMixedUnionTypes')) {
         result = 'mixed';
      } else {
        // Indicate nullable by converting type to union type with null
        result = `${type.replace(nullable, '')}|null`;
      }
    }
    return result;
  }
}
