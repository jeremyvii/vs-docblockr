/**
 * JavaScript specific language parser
 */

'use strict';

import { Param, Parser, Tokens } from '../parser';

export class Java extends Parser {
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
