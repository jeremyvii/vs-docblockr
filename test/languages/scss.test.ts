/**
 * Tests specific to parsing the PHP language
 */

import * as assert from 'assert';
import { SymbolKind } from 'vscode';

import { SCSS } from '../../src/languages/scss';
import config from '../defaultConfiguration';

const parser = new SCSS('scss');

parser.style = config.style;
parser.columnCount = config.columnSpacing;

suite('SCSS', () => {
  suite('getSymbols', () => {
    test('should parse function', () => {
      const token = parser.getSymbols('@function foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse function with arguments', () => {
      const token = parser.getSymbols('@function foo($arg1, $arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, undefined);
        }
      }
    });
  });

  suite('renderBlock', () => {
    test('should render function docblock', () => {
      const token = parser.getSymbols('@function foo($bar) {');
      const result = parser.renderBlock(token).value;

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   {${2:[type]}\\}  \\$bar  ${3:[\\$bar description]}',
        ' *',
        ' * @return  {${4:[type]}\\}        ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });
  });
});
