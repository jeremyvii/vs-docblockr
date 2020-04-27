/**
 * Java specific language parser
 */

'use strict';

import { Token } from 'acorn';
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
        identifier: '[a-zA-Z_$0-9]',
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
    return;
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
    return;
  }

  /**
   * @inheritdoc
   */
  protected parseVariable(token: Token, symbols: Symbols) {
    return;
  }
}
