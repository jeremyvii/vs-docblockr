/**
 * PHP specific language parser
 */

'use strict';

import { Parser } from '../parser';

import { IThemedToken } from 'shiki/dist/themedTokenizer';

export class PHP extends Parser {
  protected classGrammars = {
    name: [
      'entity.name.type.class.php',
    ],
    type: [
      'storage.type.class.php',
    ],
  };

  protected functionGrammars = {
    name: [
      'entity.name.function.php',
    ],
    parameter: [
      'meta.function.arguments.php',
    ],
    type: [
      'storage.type.function.php',
    ],
  };

  protected variableGrammars = {
    name: [
      'variable.other.php',
    ],
    type: [],
  };

  constructor() {
    super({});

    this.languageId = 'php';
  }

  public async getTokens(code: string): Promise<IThemedToken[][]> {
    code = `<?php\n${code}`;

    return super.getTokens(code);
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
