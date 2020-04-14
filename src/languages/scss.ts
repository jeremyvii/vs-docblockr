/**
 * Scss specific language parser
 */

'use strict';

import { workspace } from 'vscode';

import { Token } from 'acorn';
import { Parser } from '../parser';
import { Symbols } from '../symbols';

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
   * @param   {mixed}   tokens  Symbols created from the previous tokenize
   *                            instance
   *
   * @return  {Symbols}          Symbols retrieved from Lexer output
   */
  public tokenize(
    code: string,
    tokens: Symbols = new Symbols(),
  ): Symbols {
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
    desc: string,
  ): string {
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

  protected parseClass(token: Token, symbols: Symbols) {

  }

  protected parseFunction(token: Token, symbols: Symbols) {

  }

  protected parseVariable(token: Token, symbols: Symbols) {

  }
}
