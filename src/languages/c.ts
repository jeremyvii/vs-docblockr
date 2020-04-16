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

  /**
   * Create tokenized object based off of the output from the Lexer
   *
   * @param   {string}  code    Code to lex via the bug lexer
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

  protected parseClass(token: Token, symbols: Symbols) {

  }

  protected parseFunction(token: Token, symbols: Symbols) {

  }

  protected parseParameters(token: Token, symbols: Symbols) {

  }

  protected parseVariable(token: Token, symbols: Symbols) {

  }
}
