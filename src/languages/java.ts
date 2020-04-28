/**
 * Java specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { SymbolKind } from 'vscode';
import { Parser } from '../parser';
import { Symbols } from '../symbols';

/**
 * Parses tokens for the Java language
 */
export class Java extends Parser {
  /**
   * Constructs settings specific to Java
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
        identifier: '([a-zA-Z_$0-9]+)',
        modifiers: [
          'abstract',
          'final',
          'native',
          'none',
          'private',
          'protected',
          'public',
          'strictfp',
          'static',
          'synchronized',
          'transient',
          'volatile',
        ],
        types: [
          'boolean',
          'byte',
          'char',
          'double',
          'float',
          'int',
          'long',
          'short',
          'void',
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
    return;
  }

  /**
   * @inheritdoc
   */
  protected parseParameters(token: Token, symbols: Symbols) {
    if (token.type.label === '(') {
      symbols.type = SymbolKind.Function;
      symbols.return.type = symbols.varType;
      symbols.return.present = true;

      this.expectParameter = true;
    }

    if (symbols.type === SymbolKind.Function && this.expectParameter) {
      if (token.value && this.grammar.is(token.value, 'types') && this.expectParameter) {
        this.expectParameterType = true;

        symbols.addParameter({
          name: '',
          type: token.value,
        });
      }

      if (this.expectParameterType && token.value) {
        const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

        if (lastParam) {
          lastParam.name = token.value;
        }
      }

      if (token.type.label === ')') {
        this.expectParameter = false;

        return;
      }
    }

    return;
  }

  /**
   * @inheritdoc
   */
  protected parseVariable(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'types') && !symbols.type) {
      symbols.varType = token.value;
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
