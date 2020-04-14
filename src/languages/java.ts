/**
 * Java specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { Parser } from '../parser';
import { Symbols } from '../symbols';

export class Java extends Parser {
  /**
   * Constructs settings specific to Java
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['abstract', 'final', 'native', 'none', 'private',
          'protected', 'public', 'strictfp', 'static', 'synchronized',
          'transient', 'volatile'],
        types: ['boolean', 'byte', 'char', 'double', 'float', 'int',
          'long', 'short', 'void'],
        variables: ['const', 'let', 'var'],
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
  public tokenize(
    code: string,
    tokens = new Symbols(),
  ): Symbols {
    return tokens;
  }

  protected parseClass(token: Token, symbols: Symbols) {

  }

  protected parseFunction(token: Token, symbols: Symbols) {

  }

  protected parseVariable(token: Token, symbols: Symbols) {

  }
}
