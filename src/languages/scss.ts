/**
 * Scss specific language parser
 */

'use strict';

import { workspace } from 'vscode';
import { Param, Parser, Tokens } from '../parser';

export class Scss extends Parser {
  /**
   * Constructs settings specific to Scss
   */
  constructor() {
    const config = workspace.getConfiguration('vs-docblockr');
    super({
      commentClose: config.get('scssCommentClose'),
      commentOpen: config.get('scssCommentOpen'),
      grammar: {
        class: 'class',
        function: '@function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: [],
        types: [],
        variables: [],
      },
      separator: config.get('scssCommentSeparator'),
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
      const lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      const result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);
      // Check if first lexed token is a function
      const isFunction = this.matchesGrammar(result.val, 'function');
      // Check if we have gotten a token value
      if (isFunction) {
        // Append matched token to token type
        tokens.type = result.val;
        // The next time this function is ran,
        // indicate that it should expect a name
        next = result.val;
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
              val:  lexed[i].val,
            };
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
    }
    return tokens;
  }

  /**
   * This method is modified to add the brackets `{}` required by SassDoc
   *
   * @inheritdoc
   */
  public getParamTag(
    c: string,
    type: string,
    t: string,
    name: string,
    p: string,
    desc: string): string {
    let tag = `@param${c} {${type}}${t}${name}${p}${desc}`;
    if (this.style === 'drupal') {
      tag = `@param${c}{${type}}${c}${name}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  /**
   * This method is modified to add the brackets `{}` required by SassDoc
   *
   * @inheritdoc
   */
  public getReturnTag(type: string, spacing: string, desc: string): string {
    let tag = `@return${this.columns}{${type}}${spacing}${desc}`;
    if (this.style === 'drupal') {
      tag = `@return${this.columns}{${type}}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  /**
   * This method is modified to add the brackets `{}` required by SassDoc
   *
   * @inheritdoc
   */
  public getVarTag(columns: string, type: string): string {
    return `@var${columns}{${type}}`;
  }
}
