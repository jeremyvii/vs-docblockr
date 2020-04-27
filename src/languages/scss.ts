/**
 * Scss specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { SymbolKind, workspace } from 'vscode';

import { Parser } from '../parser';
import { Symbols } from '../symbols';

/**
 * Parses tokens for the SCSS language
 */
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
        class: ['class'],
        function: ['function'],
        identifier: '[a-zA-Z_$0-9]',
        modifiers: [],
        types: [],
        variables: [],
      },
      separator: config.get('scssCommentSeparator'),
    });
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
   * @inheritdoc
   */
  public getSymbols(code: string): Symbols {
    // Strip leading @ characters, as these will break acorn tokenization
    code = code.replace('@', '');

    return super.getSymbols(code);
  }

  /**
   * This method is modified to add the brackets `{}` required by SassDoc
   *
   * @inheritdoc
   */
  public getVarTag(columns: string, type: string): string {
    return `@var${columns}{${type}}`;
  }

  /**
   * @inheritdoc
   */
  protected parseClass(token: Token, symbols: Symbols) {
    return;
  }

  /**
   * @inheritdoc
   */
  protected parseFunction(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'function')) {
      symbols.type = SymbolKind.Function;
      symbols.return.present = true;

      this.expectName = true;

      return;
    }

    if (this.expectName && symbols.type === SymbolKind.Function) {
      symbols.name = token.value;

      this.expectName = false;
    }
  }

  /**
   * @inheritdoc
   */
  protected parseParameters(token: Token, symbols: Symbols) {
    if (symbols.type === SymbolKind.Function) {
      if (token.type.label === '(') {
        this.expectParameter = true;
      }

      if (this.expectParameter && token.value) {
        const parameterExpression = new RegExp(`(${this.grammar.identifier}+)`);

        if (parameterExpression.test(token.value)) {
          symbols.params.push({
            name: token.value,
            val: '',
          });
        }
      }

      if (token.type.label === ')') {
        this.expectParameter = false;
      }
    }
  }

  /**
   * @inheritdoc
   */
  protected parseVariable(token: Token, symbols: Symbols) {
    return;
  }
}
