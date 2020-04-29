import { Token } from 'acorn';
import { SymbolKind } from 'vscode';

import { Parser } from '../parser';
import { Symbols } from '../symbols';

/**
 * Parses tokens for the TypeScript and JavaScript language
 */
export class TypeScript extends Parser {
  /**
   * Informs the parser that the next token should be a generic parameter type
   *
   * @example
   * function foo(bar: Array<number>) {
   * }
   *
   * @var {boolean}
   */
  public expectGenericParameterType = false;

  /**
   * Informs the parser that the next token should be a generic return type
   *
   * @example
   * function foo(): Array<number> {
   * }
   *
   * @var {boolean}
   */
  public expectGenericReturnType = false;

  /**
   * Constructs settings specific to TypeScript
   */
  constructor() {
    super({
      grammar: {
        class: [
          'class',
          'interface',
        ],
        function: [
          'function',
        ],
        identifier: '([a-zA-Z_$0-9]+)',
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

  /**
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
  public getVarTag(type: string): string {
    return `@var {${type}}`;
  }

  /**
   * @inheritdoc
   */
  protected parseClass(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'class')) {
      symbols.type = SymbolKind.Class;

      this.expectName = true;

      return;
    }

    if (this.expectName && symbols.type === SymbolKind.Class && this.isName(token.value)) {
      symbols.name = token.value;

      this.expectName = false;
      this.done = true;
    }
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

    if (token.type.label === '(') {
      symbols.type = SymbolKind.Function;
      symbols.return.present = true;
      this.expectParameter = true;
    }

    if (symbols.type === SymbolKind.Function) {
      this.parseReturnType(token, symbols);

      if (this.expectName && this.isName(token.value) && !symbols.name) {
        symbols.name = token.value;

        this.expectName = false;

        return;
      }
    }
  }

  /**
   * Parses parameter name tokens
   *
   * @param  {Token}    token    The token retrieved from acorn
   * @param  {Symbols}  symbols  The symbols parsed from the tokens
   */
  protected parseParameterName(token: Token, symbols: Symbols) {
    if (this.expectGenericParameterType && token.value) {
      const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

      if (lastParam) {
        lastParam.type += `<${token.value}>`;
      }

      this.expectGenericParameterType = false;

      return;
    }

    const notType = !(this.expectParameterType || this.expectGenericParameterType);

    if (this.expectParameter && this.isName(token.value) && notType) {
      symbols.addParameter({
        name: token.value,
      });

      return;
    }
  }

  /**
   * @inheritdoc
   */
  protected parseParameters(token: Token, symbols: Symbols) {
    if (symbols.type === SymbolKind.Function) {
      if (token.type.label === '</>/<=/>=') {
        this.expectGenericParameterType = true;

        return;
      }

      this.parseParameterName(token, symbols);
      this.parseParameterType(token, symbols);

      if (token.type.label === ')') {
        this.expectParameter = false;

        return;
      }
    }
  }

  /**
   * Parses parameter type tokens
   *
   * @param  {Token}    token    The token retrieved from acorn
   * @param  {Symbols}  symbols  The symbols parsed from the tokens
   */
  protected parseParameterType(token: Token, symbols: Symbols) {
    if (token.type.label === ':' && !this.expectReturnType) {
      this.expectParameterType = true;

      return;
    }

    if (this.expectParameterType && token.value) {
      this.expectParameterType = false;

      const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

      if (lastParam) {
        lastParam.type = token.value;
      }

      return;
    }

    if (token.type.label === '[') {
      const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

      if (lastParam) {

        lastParam.type += '[]';
      }

      return;
    }
  }

  /**
   * Parses return type from Acorn token
   *
   * @param  {Token}    token    The token to parse
   * @param  {Symbols}  symbols  The parsed symbols
   */
  protected parseReturnType(token: Token, symbols: Symbols) {
    if (token.type.label === '</>/<=/>=') {
      this.expectGenericReturnType = true;

      return;
    }

    if (this.expectGenericParameterType && token.value) {
      symbols.return.type += `<${token.value}>`;

      this.expectGenericReturnType = false;

      return;
    }

    if (token.type.label === '[') {
      symbols.return.type += '[]';

      return;
    }

    if (token.type.label === ':' && !this.expectParameter) {
      this.expectReturnType = true;

      return;
    }

    if (this.expectReturnType && this.matchesIdentifier(token.value)) {
      this.expectReturnType = false;

      symbols.return.type = token.value;

      return;
    }
  }

  /**
   * @inheritdoc
   */
  protected parseVariable(token: Token, symbols: Symbols) {
    if (symbols.type === SymbolKind.Function) {
      return;
    }

    const isVariable = this.grammar.is(token.value, 'variables');
    const isModifier = this.grammar.is(token.value, 'modifiers');

    if (!symbols.type && (isVariable || isModifier)) {
      symbols.type = SymbolKind.Variable;

      this.expectName = true;

      return;
    }

    if (token.type.label === '.') {
      symbols.type = SymbolKind.Variable;

      this.expectName = true;

      return;
    }

    if (this.expectName && symbols.type === SymbolKind.Variable && this.isName(token.value)) {
      symbols.name = token.value;

      this.expectName = false;
    }
  }
}
