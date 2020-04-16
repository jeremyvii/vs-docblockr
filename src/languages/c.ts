/**
 * C specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { Parser } from '../parser';
import { Symbols } from '../symbols';

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
  }

  protected parseClass(token: Token, symbols: Symbols) {
    return;
  }

  protected parseFunction(token: Token, symbols: Symbols) {
    return;
  }

  protected parseParameters(token: Token, symbols: Symbols) {
    return;
  }

  protected parseVariable(token: Token, symbols: Symbols) {
    return;
  }
}
