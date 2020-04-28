/**
 * C specific language parser
 */

'use strict';

import { Token } from 'acorn';
import { SymbolKind } from 'vscode';

import { Parser } from '../parser';
import { Symbols } from '../symbols';

/**
 * Parses tokens for the Java language
 */
export class C extends Parser {
  /**
   * Constructs settings specific to C
   */
  constructor() {
    super({
      grammar: {
        class: [
          'struct',
          'typedef',
        ],
        identifier: '^[a-zA-Z_][a-zA-Z0-9_]*$',
        modifiers: [
          'unsigned',
          'signed',
          'struct',
          'static',
          'inline',
          'const',
          'auto',
          'extern',
          'complex',
        ],
        types: [
          'char',
          'double',
          'float',
          'int',
          'long',
          'short',
          'void',
        ],
        variables: [],
      },
    });
  }

  /**
   * @inheritdoc
   */
  protected parseClass(token: Token, symbols: Symbols) {
    if (this.grammar.is(token.value, 'class')) {
      symbols.name = 'struct';
      symbols.type = SymbolKind.Class;

      this.done = true;

      return;
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

    if (this.expectName && this.isName(token.value)) {
      symbols.name = token.value;

      this.expectName = false;
    }
  }
}
