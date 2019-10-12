/**
 * C specific language parser
 */

'use strict';

import { Parser } from '../parser';
import { Param, Tokens } from '../tokens';

export class C extends Parser {
  /**
   * Constructs settings specific to C
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        modifiers: [
          'unsigned',
          'signed',
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
      const mods = this.settings.grammar.modifiers;
      // Lex code string provided
      let lexed = this.lex(code);
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);

      const cExp = new RegExp(`^\\s*(${mods.join('|')})?\\s*(${types.join('|')})\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{`);
      if (cExp.test(code)) {
        const functionResults = cExp.exec(code);

        tokens.type = functionResults[2];
        tokens.name = functionResults[3];

        const tempParams = functionResults[4];

        if (tempParams) {
          lexed = this.lex(`(${tempParams})`);

          if (this.findByType('start-attributes', lexed)) {
            let paramType = '';
            for (const i in lexed) {
              if (lexed[i].type === 'attribute') {
                if (this.matchesGrammar(lexed[i].name, 'types')) {
                  paramType = lexed[i].name;
                } else {
                  const param: Param = {
                    name: lexed[i].name,
                    val: '',
                  };
                  if (paramType) {
                    param.type = paramType;
                  }

                  tokens.params.push(param);
                }
              }
            }
          }
        }
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
    }

    // console.log(tokens);
    return tokens;
  }
}
