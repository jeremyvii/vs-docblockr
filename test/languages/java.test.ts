/**
 * Tests specific to parsing the Java language
 */

import * as assert from 'assert';
import { SymbolKind } from 'vscode';

import { Java } from '../../src/languages/java';
import config from '../defaultConfiguration';

const parser = new Java();

parser.style = config.style;
parser.columnCount = config.columnSpacing;

suite('Java', () => {
  suite('getSymbols', () => {
    test('should parse variable', () => {
      const token = parser.getSymbols('int foo = 5;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.varType, 'int');
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse undefined variable', () => {
      const token = parser.getSymbols('boolean foo;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.varType, 'boolean');
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse function', () => {
      const token = parser.getSymbols('public void foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
      assert.strictEqual(token.return.type, 'void');
    });

    test('should parse function with arguments', () => {
      const token = parser.getSymbols('public void foo(int arg1, int arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, 'int');
        }
      }
    });

    test('should parse function with multiple modifiers', () => {
      const token = parser.getSymbols('public static void foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
      assert.strictEqual(token.return.type, 'void');
    });

    test('should parse class', () => {
      const token = parser.getSymbols('class Bar {');

      assert.strictEqual(token.name, 'Bar');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse abstract class', () => {
      const token = parser.getSymbols('abstract class Bar {');

      assert.strictEqual(token.name, 'Bar');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });
  });

  suite('renderBlock', () => {
    test('should render class docblock', () => {
      const token = parser.getSymbols('class Foo {');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[Foo description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should render function docblock', () => {
      const token = parser.getSymbols('public void foo(int arg1, int arg2) {');

      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   ${2:int}   arg1  ${3:[arg1 description]}',
        ' * @param   ${2:int}   arg2  ${3:[arg2 description]}',
        ' *',
        ' * @return  ${4:void}        ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should render variable docblock', () => {
      const token = parser.getSymbols('int foo = 5;');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @var ${2:int}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });
  });
});
