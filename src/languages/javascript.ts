/**
 * JavaScript specific language parser
 */

'use strict';

import { Param, Parser, Tokens } from '../parser';

export class JavaScript extends Parser {
  /**
   * Constructs settings specific to JavaScript
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['get', 'set', 'static'],
        variables: ['const', 'let', 'var'],
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
  public tokenize(code: string, next: string = '', tokens: Tokens = null): Tokens {
    // Create empty token object if none is present
    if (tokens === null) {
      tokens = {name: '', type: '', params: [], return: { present: true }};
    }
    // Don't continue unless we have workable value
    if (code !== undefined) {
      // Create shortcut to identifier string
      const identifier = this.settings.grammar.identifier;
      // Expression that checks for function prototypes before lexing. Lexing
      // prototypes can cause lexing issues regarding the remaining
      // `= function()` string
      const protoExp = new RegExp(`(${identifier}+)\.prototype\.(${identifier}+)`);
      if (protoExp.test(code)) {
        // Upon passing the expression test we can skip redundant steps, as in
        // guessing the function name and type, and pull the expression name
        // from the match, and lex the rest
        const match = protoExp.exec(code);
        tokens.type = this.settings.grammar.function;
        // Assume second match is the function's name
        tokens.name = match[2];
        // Truncate naming bit so we are left with the anonymous expression
        const expression = code.replace(match[0], '');
        // Strip leading equal sign to prevent lexer from assuming input is
        // malformed
        code = expression.replace('= ', '');
      }
      // Separate code string with lexer
      const lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      const result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);
      // Get lexed object of type "code", if exists. This is used for variable
      // blocks
      const codeLexed = this.findByType('code', lexed);
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
      }  else if (codeLexed) {
        // Set up variable docblock
        tokens.name = result.val;
        tokens.type = 'variable';
        // Indicate no return type since this is a variable token
        tokens.return.present = false

        return tokens;
      // Check for function variables let, var, etc.
      } else if (this.matchesGrammar(result.val, 'variables')) {
        // Create regular expression object for finding function variables
        const funcRegex = new RegExp(`(${identifier}+) = (${this.settings.grammar.function})`);
        // Check if regular expression matches code next up to lexed
        if (funcRegex.test(text.val)) {
          // Get matches from regular expression
          const result = funcRegex.exec(text.val);
          // Get function parameters from string
          const params = text.val.replace(result[1] + ' = ' + result[2], '');
          // Swap function name and statement to prevent pug lexer errors
          text.val = result[2] + ' ' + result[1] + params;
        } else {
          // Strip spaces from code to help pug lexer
          text.val = text.val.replace(' = ', '=').replace(';', '');
        }
        // Indicate code is a variable
        tokens.type = 'variable';
        // Variables should not have return types
        tokens.return.present = false;
      } else if (this.matchesGrammar(result.val, 'modifiers')) {
        // Recursively find function name based on modifiers
        const findName = (string: string): string => {
          // Get lexed tokens from string
          const lexed = this.lex(string);
          // Get tag token
          const tag = this.findByType('tag', lexed);
          // Get text token
          const text = this.findByType('text', lexed);
          // If result is a modifier lex the remaining code
          if (this.matchesGrammar(tag.val, 'modifiers')) {
            findName(text.val);
          } else {
            return tag.val;
          }
        };
        // Set token name and type
        tokens.name = findName(text.val);
        tokens.type = 'function';
      } else if (this.matchesGrammar(next)) {
        // Set the tokens name
        tokens.name = result.val;
      }
      // Check for any parameters in lexed array by checking for a start
      // attribute type
      if (this.findByType('start-attributes', lexed)) {
        // Iterate over lexed objects
        for (const i in lexed) {
          // Check if object is an attribute
          if (lexed[i].type === 'attribute') {
            // Create new param object based lexed object
            const param: Param = {
              name: lexed[i].name,
              val:  lexed[i].val
            }
            // Push param to parameter list
            tokens.params.push(param);
          }
        }
      }
      // Check if the end of the line has been reached
      if (text && text.col < eos.col) {
        // Create new regular expression object based on grammar identifier
        const cleanExp = new RegExp('^' + this.settings.grammar.identifier);
        // Make sure we aren't about to lex malformed input
        if (cleanExp.test(text.val.substr(0, 1))) {
          // Continue the lexing process and the data up next
          this.tokenize(text.val, next, tokens);
        }
      }
      // Check if a name was set.
      if (!tokens.name) {
        // If not, assume the tag value should be the token's name
        tokens.name = result.val;
      }
    }
    return tokens;
  }

  /**
   * Renders parameter tag template for docblock. This method is
   * being overwritten in order to wrap `{}` around binding types
   *
   * Arguments c, t, p should be assumed to be computed by `renderParamTags()`.
   * These ambiguous argument names simply refer to the spaces between columns.
   *
   * @param   {string}  c     Spaces computed between initial tag and param type
   * @param   {string}  type  The variable type of said parameter
   * @param   {string}  t     Spaces computed between param type and param name
   * @param   {string}  name  Parameter's name binding
   * @param   {string}  p     Spaces computed between param name and description
   * @param   {string}  desc  Describes the parameter
   *
   * @return  {string}        Rendered parameter tag
   */
  public getParamTag(
    c: string,
    type: string,
    t: string,
    name: string,
    p: string,
    desc: string): string {
    return `@param${c} {${type}}${t}${name}${p}${desc}`;
  }

  /**
   * Renders return tag with return type and computed spacing. This method is
   * being overwritten in order to wrap `{}` around binding types
   *
   * @param   {string}  columns  Computed spaces between tag and type
   * @param   {string}  type     Type associated with return value (in docblock
   *                             not this method)
   *
   * @return  {string}           Rendered return tag
   */
  public getReturnTag(columns: string, type: string): string {
    return `@return${columns}{${type}}`;
  }

  /**
   * Renders var tag with property type and computed spacing. This method is
   * being overwritten in order to wrap `{}` around binding types
   *
   * @param   {string}  columns  Computed spaces between tag and type
   * @param   {string}  type     Type associated with property value (in docblock
   *                             not this method)
   *
   * @return  {string}           Rendered property tag
   */
  public getVarTag(columns: string, type: string): string {
    return `@var${columns}{${type}}`;
  }
}