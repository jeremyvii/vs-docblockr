/**
 * TypeScript specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { SymbolKind } from 'vscode';
import { Parser } from '../parser';
import { Symbols } from '../symbols';

export class TypeScript extends Parser {
  /**
   * Constructs settings specific to TypeScript
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['get', 'set', 'static', 'public', 'private', 'protected'],
        types: ['any', 'boolean', 'never', 'null', 'number', 'string', 'void',
          'undefined'],
        variables: ['const', 'let', 'var'],
      },
    });
  }

  /**
   * Create tokenized object based off of the output from the Lexer
   *
   * @param   {string}  code    Code to lex via the bug lexer
   * @param   {mixed}   tokens  Symbols created from the previous tokenize
   *                            instance
   *
   * @return  {Symbols}          Symbols retrieved from Lexer output
   */
  public tokenize(
    code: string,
    symbols: Symbols = new Symbols(),
  ): Symbols {
    for (const token of this.lex(code)) {
      if (this.done) {
        break;
      }

      this.parseClass(token, symbols);
      this.parseFunction(token, symbols);
      this.parseVariable(token, symbols);
    }

    return symbols;
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
    desc: string,
  ): string {
    let tag = `@param${c} {${type}}${t}${name}${p}${desc}`;
    if (this.style === 'drupal') {
      tag = `@param${c}{${type}}${c}${name}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  /**
   * This method is modified to add the brackets `{}` required by jsDoc
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
   * This method is modified to add the brackets `{}` required by jsDoc
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
    const isVariableType = this.grammar.variables.includes(token.value);

    if (isVariableType) {
      symbols.type = SymbolKind.Variable;

      this.expectName = true;

      return;
    }

    if (this.expectName) {
      symbols.name = token.value;

      this.expectName = false;
      this.done = true;
    }
  }
}
