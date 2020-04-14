/**
 * C specific language parser
 */

'use strict';

import { ILexed, LexerToken } from '../lexer';
import { Parser } from '../parser';
import { IParam, Tokens } from '../tokens';

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
      const types = this.settings.grammar.types;
      const mods = this.settings.grammar.modifiers.map((val) => `${val}\\s*`);

      let lexed: ILexed[];

      // Define an expression to matches C functions
      const functionPattern = `^\\s*(${mods.join('|')})*?(${types.join('|')})\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{?`;
      const functionExp = new RegExp(functionPattern);
      // Test if the current code matches the function regular expression
      if (functionExp.test(code)) {
        // Get an array of function pieces based on the expression
        const functionResults = functionExp.exec(code);

        // Guess the functions name and return type based on the matches
        tokens.name = functionResults[3];
        tokens.type = 'function';
        tokens.return.type = functionResults[2];

        // Fetch the functions parameters, if any
        const tempParams = functionResults[4];

        // Determine if any parameters were found
        if (tempParams) {
          lexed = this.lex(`(${tempParams})`);

          // Check if the lexer parsed any attributes.
          if (this.findByType(LexerToken.startAttributes, lexed)) {
            // Create a placeholde variable for the parameter's type, since it
            // preceeds the parameter's name
            let paramType = '';

            for (const i in lexed) {
              // Only operate on items with the attribute type
              if (lexed[i].type === LexerToken.attribute) {
                // Check if the current item matches any of the parameter types
                if (this.matchesGrammar(lexed[i].name, 'types')) {
                  paramType = lexed[i].name;
                } else if (this.matchesGrammar(lexed[i].name, 'modifiers')) {
                  // Skip any modifiers that may exist in the arguments
                } else {
                  // Set the parameter's name
                  const param: IParam = {
                    name: lexed[i].name,
                    val: '',
                  };

                  // Set the parameter's type if there is any
                  if (paramType) {
                    param.type = paramType;
                  }

                  tokens.params.push(param);
                }
              }
            }
          }

          return tokens;
        }
      }

      // Define an expression to match C structs
      const structExp = new RegExp(/^(typedef)?\s?struct\s?([\w]*)?{?/);
      // Test if current code snippet matches the C struct pattern
      if (structExp.test(code)) {
        // Since using typedef names can be after the `{}` don't match the
        // struct's name
        tokens.name = 'struct';
        tokens.type = 'struct';
        tokens.return.present = false;

        return tokens;
      }

      // Define an expression to match C variables
      const varExp = new RegExp(`\\b(?:(?:${mods.join('|')})*)(?:(?:\\s+\\*?\\*?\\s*)*)(${types.join('|')})\\s*([a-zA-Z_][a-zA-Z0-9_]*)\\s*[\\[;,=)]`);
      // Test if the current code snippet is a variable
      if (varExp.test(code)) {
        // Find the variable name and type
        const varResults = varExp.exec(code);

        tokens.name = varResults[2];
        tokens.varType = varResults[1];

        tokens.type = 'variable';

        tokens.return.present = false;

        return tokens;
      }
    }

    return tokens;
  }
}
