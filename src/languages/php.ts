import { Token } from 'acorn';
import { SymbolKind } from 'vscode';

import { Parser } from '../parser';
import { Symbols } from '../symbols';

/**
 * Parses tokens for the PHP language
 */
export class PHP extends Parser {
  /**
   * Constructs settings specific to PHP
   */
  constructor() {
    super({
      grammar: {
        class: [
          'class',
          'trait',
        ],
        function: [
          'function',
        ],
        identifier: '([a-zA-Z0-9_$\x7f-\xff]+)',
        modifiers: [
          'public',
          'static',
          'protected',
          'private',
          'abstract',
          'final',
        ],
        types: [
          'self',
          'array',
          'callable',
          'bool',
          'boolean',
          'float',
          'int',
          'integer',
          'string',
          'iterable',
          'stdClass',
        ],
        variables: [
          'const',
        ],
      },
    });
  }

  /**
   * Checks if the given string is a PHP type hint property
   *
   * @param   {string}   type  The string to check
   *
   * @return  {boolean}        Whether or not the string is a valid type
   */
  protected isType(type: string): boolean {
    const grammar = [
      'function',
      'class',
      'modifiers',
      'variables',
    ];

    const notReserved = grammar.every((item) => {
      return !this.grammar.is(type, item);
    });

    const isType = this.grammar.is(type, 'types');

    const classExpression = /^[a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*$/;

    const notNull = !/(null|NULL)/.test(type);

    return notReserved && notNull && (isType || classExpression.test(type));
  }

  /**
   * Checks if the given string is a variable PHP variable name
   *
   * @param   {string}  name  The string being checked
   *
   * @return  {boolean}       Whether or not the string is a variable name
   */
  protected isVariableName(name: string): boolean {
    const isVariable = /^\$/;

    return isVariable.test(name);
  }

  /**
   * @inheritdoc
   */
  protected parseClass(token: Token, symbols: Symbols) {
    // Check if the token represents a class identifier
    if (this.grammar.is(token.value, 'class')) {
      symbols.type = SymbolKind.Class;

      this.expectName = true;

      return;
    }

    // Check if the current token represents a valid class name
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
    // Check if the token represents a function identifier
    if (this.grammar.is(token.value, 'function')) {
      symbols.type = SymbolKind.Function;

      this.expectName = true;

      return;
    }

    if (symbols.type === SymbolKind.Function) {
      // Check for an array return type
      if (token.type.label === '[') {
        symbols.return.type += '[]';

        return;
      }

      // Check for a valid function name
      if (this.expectName && this.isName(token.value)) {
        symbols.name = token.value;

        this.expectName = false;

        return;
      }

      // Expect a function return type
      if (token.type.label === ':' && !this.expectParameter) {
        this.expectReturnType = true;

        return;
      }

      // Check for a valid function return type
      if (this.expectReturnType && this.matchesIdentifier(token.value)) {
        this.expectReturnType = false;

        symbols.return.type = token.value;

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
    const notType = !this.expectParameterType;

    // Check for a valid parameter name
    if (this.expectParameter && this.isVariableName(token.value) && notType) {
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
      // If an opening parenthesis occurs, expect the next tokens to represent
      // function parameters
      if (token.type.label === '(') {
        this.expectParameter = true;
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
    // Check for a valid parameter type
    if (token.value && this.isType(token.value) && this.expectParameter) {
      this.expectParameterType = true;

      symbols.addParameter({
        name: '',
        type: token.value,
      });
    }

    // Check for a valid parameter name
    if (this.expectParameterType && this.isVariableName(token.value)) {
      const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

      if (lastParam) {
        lastParam.name = token.value;

        this.expectParameterType = false;
      }
    }
  }

  /**
   * @inheritdoc
   */
  protected parseVariable(token: Token, symbols: Symbols) {
    // Check for a valid variable name
    if (!symbols.type && this.isVariableName(token.value)) {
      symbols.name = token.value;
      symbols.type = SymbolKind.Variable;
    }

    // Check for PHP constants
    if (!symbols.type && this.grammar.is(token.value, 'variables')) {
      symbols.type = SymbolKind.Variable;

      this.expectName = true;

      return;
    }

    // Check for a valid variable name
    if (symbols.type === SymbolKind.Variable && this.expectName && token.value) {
      symbols.name = token.value;

      this.expectName = false;

      return;
    }
  }
}
