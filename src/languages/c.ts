/**
 * C specific language parser
 */

'use strict';

import { Tokens } from '../tokens';
import { Parser } from '../parser';

export class C extends Parser {
  /**
   * Constructs settings specific to C
   */
  constructor() {
    super({
      grammar: {
        function: 'function',
        class: 'class',
        identifier: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        modifiers: [],
        variables: [],
        types: [
          'char',
          'double',
          'float',
          'int',
          'short',
          'long',
          'void',
        ],
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
  public tokenize(
    code: string,
    next: string = '',
    tokens: Tokens = new Tokens(),
  ): Tokens {
    // Don't continue unless we have a workable value
    if (code !== undefined) {
      // Short cut to valid variable name
      const ident = this.settings.grammar.identifier;
      const types = this.settings.grammar.types;
      // Lex code string provided
      const lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      const result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);

      const cExp = new RegExp(`^\\s*(unsigned|signed)?\\s*(${types.join('|')})\\s+(\\w+)\\s*\\([^)]*\\)\\s*\\{`);

      if (cExp.test(code)) {
        const functionResults = cExp.exec(code);

        tokens.type = functionResults[2];
        tokens.name = functionResults[3];

      }

      // Check if the end of the line has been reached
      if (text && text.col < eos.col) {
        // Create new regular expression object based on grammar identifier
        const regex = new RegExp(`^[${ident}]`);
        // Make sure we aren't about to lex malformed input
        if (regex.test(text.val.substr(0, 1))) {
          // Continue the lexing process and the data up next
          this.tokenize(text.val, next, tokens);
        }
      }
      console.log([
        result, text, eos,
      ]);
    }

    console.log(tokens);
    return tokens;
  }
}
