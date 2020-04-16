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
        class: [
          'class',
        ],
        function: [
          'function',
        ],
        identifier: '[a-zA-Z_$0-9]',
        modifiers: [
          'get',
          'set',
          'static',
          'public',
          'private',
          'protected',
        ],
        types: [
          'any',
          'boolean',
          'never',
          'null',
          'number',
          'string',
          'void',
          'undefined',
        ],
        variables: [
          'const',
          'let',
          'var',
        ],
      },
    });
  }

  public getSymbols(
    code: string,
    symbols: Symbols = new Symbols(),
  ): Symbols {
    for (const token of this.lex(code)) {
      if (this.done) {
        break;
      }

      this.parseClass(token, symbols);
      this.parseFunction(token, symbols);
      this.parseParameters(token, symbols);
      this.parseVariable(token, symbols);
    }

    this.reset();

    return symbols;
  }

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

  public getReturnTag(type: string, spacing: string, desc: string): string {
    let tag = `@return${this.columns}{${type}}${spacing}${desc}`;
    if (this.style === 'drupal') {
      tag = `@return${this.columns}{${type}}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  public getVarTag(columns: string, type: string): string {
    return `@var${columns}{${type}}`;
  }

  protected parseClass(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'class')) {
      symbols.type = SymbolKind.Class;

      this.expectName = true;

      return;
    }

    if (this.expectName && symbols.type === SymbolKind.Class) {
      symbols.name = token.value;

      this.expectName = false;
      this.done = true;

    }
  }

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

    if (token.type.label === ':' && !this.expectParameterType) {
      this.expectReturnType = true;
    }

    if (this.expectReturnType && token.value) {
      this.expectReturnType = false;

      symbols.return.type = token.value;
    }
  }

  protected parseParameters(token: Token, symbols: Symbols) {
    if (symbols.type === SymbolKind.Function) {
      if (token.type.label === '(') {
        this.expectParameter = true;
      }

      if (this.expectParameter && token.value && !this.expectParameterType) {
        const parameterExpression = new RegExp(`(${this.grammar.identifier}+)`);

        if (parameterExpression.test(token.value)) {
          symbols.params.push({
            name: token.value,
            val: '',
          });
        }
      }

      if (token.type.label === ':' && !this.expectReturnType) {
        this.expectParameterType = true;
      }

      if (this.expectParameterType && token.value) {
        this.expectParameterType = false;

        if (this.grammar.is(token.value, 'types')) {
          symbols.params[symbols.params.length - 1].type = token.value;
        }
      }

      if (token.type.label === ')') {
        this.expectParameter = false;
      }
    }
  }

  protected parseVariable(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'variables')) {
      symbols.type = SymbolKind.Variable;

      this.expectName = true;

      return;
    }

    if (this.expectName && symbols.type === SymbolKind.Variable) {
      symbols.name = token.value;

      this.expectName = false;
      this.done = true;
    }
  }
}
