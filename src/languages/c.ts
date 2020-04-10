/**
 * C specific language parser
 */

'use strict';

import { Parser } from '../parser';

export class C extends Parser {
  /**
   * Constructs settings specific to C
   */
  constructor() {
    super({
      grammar: {
        class: 'struct',
        identifier: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        modifiers: [
          'unsigned',
          'signed',
          'struct',
          'static',
          'inline',
          'const',
          'auto',
          'extern',
          'complex',
        ],
        types: [
          'char',
          'double',
          'float',
          'int',
          'long',
          'short',
          'void',
        ],
        variables: [],
      },
    });

    this.languageId = 'c';
  }
}
