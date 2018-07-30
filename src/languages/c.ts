/**
 * C specific language parser
 */

'use strict';

import { Parser, Param, Tokens } from '../parser';

export class C extends Parser {
  /**
   * Constructs settings specific to C
   */
  constructor() {
    super({
      grammar: {
        function: 'function',
        class: 'class',
        identifier: '',
        modifiers: [],
        variables: [],
        types: [],
      }
    });
  }

  /**
   * Create tokenized object based off of the output from the Lexer
   * 
   * @param   {string}  code    Code to lex via the bug lexer
   * @param   {string}  next    Token name from previous function instance. Used
   *                            for letting the `tokenize` method now it should
   *                            be expecting a token name
   * @param   {mixed}   tokens  Tokens created from the previous tokenize
   *                            instance
   * 
   * @return  {Tokens}          Tokens retrieved from Lexer output
   */
  public tokenize(code: string, next: string = '', tokens: Tokens = null): Tokens {
    // Create empty token object if none is present
    if (tokens === null) {
      tokens = {name: '', type: '', params: [], return: { present: true }};
    }
    console.log(this.lex(code));
    return tokens;
  }
}