/**
 * PHP specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { SymbolKind } from 'vscode';

import { Parser } from '../parser';
import { Symbols } from '../symbols';

export class PHP extends Parser {
  /**
   * Constructs settings specific to PHP
   */
  constructor() {
    super({
      grammar: {
        class: [
          'class',
          'trait',
        ],
        function: [
          'function',
        ],
        identifier: '([a-zA-Z0-9_$\x7f-\xff]+)',
        modifiers: [
          'public',
          'static',
          'protected',
          'private',
          'abstract',
          'final',
        ],
        types: [
          'self',
          'array',
          'callable',
          'bool',
          'boolean',
          'float',
          'int',
          'integer',
          'string',
          'iterable',
        ],
        variables: [
          'const',
        ],
      },
    });
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

  protected parseClass(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'class')) {
      symbols.type = SymbolKind.Class;

      this.expectName = true;

      return;
    }

    if (this.expectName && symbols.type === SymbolKind.Class && this.isName(token.value)) {
      symbols.name = token.value;

      this.expectName = false;
      this.done = true;
    }
  }

  protected parseFunction(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'function')) {
      symbols.type = SymbolKind.Function;
      symbols.return.present = true;

      this.expectName = true;

      return;
    }

    if (symbols.type === SymbolKind.Function) {
      if (token.type.label === '[') {
        symbols.return.type += '[]';

        return;
      }

      if (this.expectName && this.isName(token.value)) {
        symbols.name = token.value;

        this.expectName = false;

        return;
      }

      if (token.type.label === ':' && !this.expectParameter) {
        this.expectReturnType = true;

        return;
      }

      if (this.expectReturnType && this.matchesIdentifier(token.value)) {
        this.expectReturnType = false;

        symbols.return.type = token.value;

        return;
      }
    }
  }

  protected parseParameters(token: Token, symbols: Symbols) {
    return;
  }

  protected parseVariable(token: Token, symbols: Symbols) {
    return;
  }
}
