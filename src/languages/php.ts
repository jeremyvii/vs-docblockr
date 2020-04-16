/**
 * PHP specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { Parser } from '../parser';
import { Symbols } from '../symbols';

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
  }

  /**
   * Create tokenized object based off of the output from the Lexer
   *
   * @param   {string}  code    Code to lex via the lexer
   * @param   {mixed}   tokens  Symbols created from the previous tokenize
   *                            instance
   *
   * @return  {Symbols}          Symbols retrieved from Lexer output
   */
  public getSymbols(
    code: string,
    tokens: Symbols = new Symbols(),
  ): Symbols {
    return tokens;
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

  }

  protected parseFunction(token: Token, symbols: Symbols) {

  }

  protected parseParameters(token: Token, symbols: Symbols) {

  }

  protected parseVariable(token: Token, symbols: Symbols) {

  }
}
