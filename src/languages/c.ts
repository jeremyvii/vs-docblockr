/**
 * C specific language parser
 */

'use strict';

import { Lexed } from '../lexer';
import { Parser } from '../parser';
import { Param, Tokens } from '../tokens';

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
      const mods = this.settings.grammar.modifiers;

      let lexed: Lexed[];

      // Define an expression to matches C functions
      const functionPattern = `^\\s*(${mods.join('|')})?\\s*(${types.join('|')})\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{?`;
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
          if (this.findByType('start-attributes', lexed)) {
            // Create a placeholde variable for the parameter's type, since it
            // preceeds the parameter's name
            let paramType = '';

            for (const i in lexed) {
              // Only operate on items with the attribute type
              if (lexed[i].type === 'attribute') {
                // Check if the current item matches any of the parameter types
                if (this.matchesGrammar(lexed[i].name, 'types')) {
                  paramType = lexed[i].name;
                } else if (this.matchesGrammar(lexed[i].name, 'modifiers')) {
                  // Skip any modifiers that may exist in the arguments
                } else {
                  // Set the parameter's name
                  const param: Param = {
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

      const structExp = new RegExp(/^(typedef)?\s?struct\s?([\w]*)?{?/);

      if (structExp.test(code)) {
        tokens.name = 'struct';
        tokens.return.present = false;

        return tokens;
      }

      const varMods = mods.map(mod => `${mod}\\s*`);

      const varExp = new RegExp(`/\\b(?:(?:${varMods.join('|')})+)(?:\\s+\\*?\\*?\\s*)([a-zA-Z_][a-zA-Z0-9_]*)\\s*[\\[;,=)]/`);

      // @TODO: new RegExp(/\b(?:(?:extern\s*|auto\s*)*)(?:\s+\*?\*?\s*)(int|float)+\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*[\[;,=)]/);

      console.log(varExp.source);

      if (varExp.test(code)) {
        const varResults = varExp.exec(code);

        console.log(varResults);
      }
    }

    return tokens;
  }
}
