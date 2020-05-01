/**
 * Tests specific to parsing the C language
 */

import * as assert from 'assert';
import { SymbolKind } from 'vscode';

import { C } from '../../src/languages/c';
import config from '../defaultConfiguration';

const parser = new C();

parser.style = config.style;
parser.columnCount = config.columnSpacing;

suite('C', () => {
  suite('getSymbols', () => {
    test('should parse variable', () => {
      const token = parser.getSymbols('int foo = 5;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.varType, 'int');
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse undefined variable', () => {
      const token = parser.getSymbols('int foo;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.varType, 'int');
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse function', () => {
      const token = parser.getSymbols('char foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
      assert.strictEqual(token.return.type, 'char');
    });

    test('should parse function with arguments', () => {
      const token = parser.getSymbols('int foo(char arg1, char arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, 'char');
        }
      }
    });

    test('should parse function with multiple modifiers', () => {
      const token = parser.getSymbols('complex static int foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
      assert.strictEqual(token.return.type, 'int');
    });

    test('should parse struct', () => {
      const token = parser.getSymbols('struct foo {');

      assert.strictEqual(token.name, 'struct');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse typedef struct', () => {
      const token = parser.getSymbols('typedef struct {');

      assert.strictEqual(token.name, 'struct');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });
  });

  suite('renderBlock', () => {
    test('should render class docblock', () => {
      const token = parser.getSymbols('struct Foo {');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[struct description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should render function docblock', () => {
      const token = parser.getSymbols('int foo(char arg1, char arg2) {');

      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   ${2:char}   arg1  ${3:[arg1 description]}',
        ' * @param   ${2:char}   arg2  ${3:[arg3 description]}',
        ' *',
        ' * @return  ${4:int}          ${5:[return description]}',
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
