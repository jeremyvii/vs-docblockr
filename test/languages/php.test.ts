/**
 * Tests specific to parsing the PHP language
 */

import * as assert from 'assert';
import { SymbolKind } from 'vscode';
import { PHP } from '../../src/languages/php';

// Get parser instance
const parser = new PHP();

suite('PHP', () => {
  suite('getSymbols', () => {
    test('should parse variable', () => {
      const token = parser.getSymbols('$foo = 5');

      assert.strictEqual(token.name, '$foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse constant', () => {
      const token = parser.getSymbols('const FOO = 5');

      assert.strictEqual(token.name, 'FOO');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse function', () => {
      const token = parser.getSymbols('function foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse function with arguments', () => {
      const token = parser.getSymbols('function foo($arg1, $arg2) {');

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

    test('should parse function with arguments passed by reference', () => {
      const token = parser.getSymbols('function foo(int &$arg): boolean {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);

      assert.strictEqual(token.params[0].name, `$arg`);
      assert.strictEqual(token.params[0].type, 'int');

      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse defined argument type', () => {
      const token = parser.getSymbols('function foo(int $bar) {');

      assert.strictEqual(token.params[0].name, '$bar');
      assert.strictEqual(token.params[0].type, 'int');
    });

    test('should parse defined return type', () => {
      const token = parser.getSymbols('function foo(): boolean {');

      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse class name as return type', () => {
      const token = parser.getSymbols('function foo(): TestClass {');

      assert.strictEqual(token.return.type, 'TestClass');
    });

    test('should parse class', () => {
      const token = parser.getSymbols('class Bar {');

      assert.strictEqual(token.name, 'Bar');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse class method', () => {
      const token = parser.getSymbols('public function foo($arg1, $arg2) {');

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

    test('should parse class method argument type', () => {
      const token = parser.getSymbols('public function foo(string $arg1, stdClass $arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);

      assert.strictEqual(token.params[0].name, '$arg1');
      assert.strictEqual(token.params[0].type, 'string');

      assert.strictEqual(token.params[1].name, '$arg2');
      assert.strictEqual(token.params[1].type, 'stdClass');
    });

    test('should parse class method with return type', () => {
      const token = parser.getSymbols('public function foo($arg1, $arg2): boolean {');
      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, undefined);
        }
      }
      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse class method with type defined arguments', () => {
      const token = parser.getSymbols('public function foo(int $arg): boolean {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);

      assert.strictEqual(token.params[0].name, `$arg`);
      assert.strictEqual(token.params[0].type, 'int');

      assert.strictEqual(token.return.type, 'boolean');
    });
  });
});
