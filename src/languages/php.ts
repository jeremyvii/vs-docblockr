/**
 * PHP specific language parser
 */

'use strict';

import { Parser } from '../parser';
import { Param, Tokens } from '../tokens';

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
    // Make sure code provided isn't undefined
    if (code !== undefined) {
      // Shortcut to language variable identifier
      const identifier = this.settings.grammar.identifier;
      // Guess if code is a variable before trying to run it through the lexer
      const varRegex = new RegExp(
        `^(\\$[${identifier}]+)[\\s]?[=]?[\\s]?([${identifier}\\(\\)\\{\\}\\[\\]"'\`,\\s]*)`);
      // Check if expression has any matches
      if (varRegex.test(code)) {
        // Get matches from variable expression
        const matches = varRegex.exec(code);
        // Set up variable token
        tokens.name           = matches[1];
        tokens.type           = 'variable';
        tokens.return.present = false;
        return tokens;
      }
      // Lex code string provided
      const lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      const result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);
      // Expression for determine if attribute is actually an argument or
      // argument type. This check is done by checking if the first character
      // is a $
      const isVar = new RegExp(`^[&]?[$][${identifier}]*`);
      // Check if first lexed token is a function
      const isFunction = this.matchesGrammar(result.val, 'function');
      // Check if first lexed token is a class
      const isClass = this.matchesGrammar(result.val, 'class');
      // Check if we have gotten a token value
      if (isFunction || isClass) {
        // Append matched token to token type
        tokens.type = result.val;
        // The next time this function is ran,
        // indicate that it should expect a name
        next = result.val;
        // Remove return tag if code is a class
        if (isClass) tokens.return.present = false;
      // Set block name
      } else if (this.matchesGrammar(next)) {
        // Set the tokens name
        tokens.name = result.val;
      }
      // Check for any parameters in lexed array by checking for a start
      // attribute type
      if (this.findByType('start-attributes', lexed)) {
        let paramNext: string = '';
        // Iterate over lexed objects
        for (const i in lexed) {
          // Check if object is an attribute
          if (lexed[i].type === 'attribute') {
            // Check if attribute is a potential language type
            if (this.matchesGrammar(lexed[i].name, 'types') ||
                !isVar.test(lexed[i].name)) {
              // Indicate that the next parameter is this type
              paramNext = lexed[i].name;
            } else {
              // Create new param object based lexed object
              const param: Param = {
                name: lexed[i].name,
                val:  lexed[i].val,
              };
              // Check if a parameter type was found
              if (paramNext) {
                param.type = this.formatNullable(paramNext);
                // Make sure all the parameters don't end up with the same type
                paramNext = '';
              }
              // Push param to parameter list
              tokens.params.push(param);
            }
          }
        }
        // Since parameters are being parsed, the proceeding tags could contain
        // a return type. Upon searching the objects for the `:` character,
        // the proceeding object could contain a valid return type
        const colon = this.findByType(':', lexed);
        if (colon !== null) {
          // The next value could be a return type
          const returnLexed = lexed[colon.index + 1];
          // Assume return type
          tokens.return.type = this.formatNullable(returnLexed.val);
        }
      }
      // Check if the end of the line has been reached
      if (text && text.col < eos.col) {
        // Create new regular expression object based on grammar identifier
        const regex = new RegExp(`^[${identifier}]`);
        // Make sure we aren't about to lex malformed input
        if (regex.test(text.val.substr(0, 1))) {
          // Continue the lexing process and the data up next
          this.tokenize(text.val, next, tokens);
        }
      }
    }
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
    // Expression to check if given nullable is nullable by checking for the
    // occurrence of a leading '?' character
    const nullable = /^\?/;
    // By default set return value as type provided
    let result = type;
    // Test if type is nullable
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
}
