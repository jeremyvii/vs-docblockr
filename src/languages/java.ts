/**
 * JavaScript specific language parser
 */

'use strict';

import { Lexed } from '../lexer';

import { Param, Parser, Tokens } from '../parser';

export class Java extends Parser {
  protected types = ['boolean', 'byte', 'char', 'double', 'float', 'int', 
    'long', 'short', 'void'];

  /**
   * Constructs settings specific to JavaScript
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
      // Separate code string with lexer
      const lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      const result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);
      // Check if first lexed token is a class
      const isClass = this.matchesGrammar(result.val, 'class');
      if (isClass) {
        // Append matched token to token type
        tokens.type = result.val;
        // The next time this function is ran,
        // indicate that it should expect a name
        next = result.val;
        // Classes should not have return tags 
       tokens.return.present = false;
      } else if (this.matchesGrammar(result.val, 'modifiers')) {
        // Recursively find function name from code string
        const findName = (code: string): string => {
          // Get list of lexed objects from code string
          const newLexed = this.lex(code);
          // Assume first tag token found is the function name
          const tag = newLexed.filter((obj) => {
            return obj.type === 'tag' && obj.line === 1 && obj.col === 1;
          }).pop();
          // Get the code next up to be lexed
          const nextCode = this.findByType('text', newLexed);
          // Check if tag is is a variable or function modifier, or is a 
          // variable type
          if (this.types.indexOf(tag.val) > -1 || /^[A-Z][a-zA-Z]+/.test(tag.val)) {
            // Since this value seems to be a variable type set it to the 
            // return type token
            tokens.return.type = tag.val;
            return findName(nextCode.val);
          } else if (this.matchesGrammar(tag.val, 'modifiers')) {
            return findName(nextCode.val);
          } else {
            return tag.val;
          }
        };
        // Expression for checking of code is a function or property
        const funcRegex = new RegExp(/([a-zA-Z_$0-9]+)(\s?)\((.*)\)/);
        // Set token name and type
        tokens.name = findName(text.val);
        tokens.type = 'variable';
        // Set no return value if code is a class property
        tokens.return.present = false;
        // Check if code is a function
        if (funcRegex.test(code)) {
          // Indicate that code is a function and display return type
          tokens.type = 'function';
          tokens.return.present = true;
        }
      } else if (this.matchesGrammar(next)) {
        // Set the token's name
        tokens.name = result.val;
        // Set next argument so we don't override class name with potential 
        // modifier names
        next = '';
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
    return `@param${c} ${type}${t}${name}${p}${desc}`;
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
    return `@return${columns}${type}`;
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
    return `@var${columns}${type}`;
  }
}
