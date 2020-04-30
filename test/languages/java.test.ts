/**
 * Tests specific to parsing the Java language
 */

import * as assert from 'assert';
import { SymbolKind } from 'vscode';
import { Java } from '../../src/languages/java';

// Get parser instance
const parser = new Java();

suite('Java', () => {
  suite('getSymbols', () => {
    test('should parse variable', () => {
      const token = parser.getSymbols('int foo = 5;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Variable);
      assert.equal(token.varType, 'int');
      assert.equal(token.params.length, 0);
    });

    test('should parse undefined variable', () => {
      const token = parser.getSymbols('boolean foo;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Variable);
      assert.equal(token.varType, 'boolean');
      assert.equal(token.params.length, 0);
    });

    test('should parse function', () => {
      const token = parser.getSymbols('public void foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'void');
    });

    test('should parse function with arguments', () => {
      const token = parser.getSymbols('public void foo(int arg1, int arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `arg${Number(i) + 1}`);
          assert.equal(token.params[i].val, null);
          assert.equal(token.params[i].type, 'int');
        }
      }
    });

    test('should parse function with multiple modifiers', () => {
      const token = parser.getSymbols('public static void foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'void');
    });

    test('should parse class', () => {
      const token = parser.getSymbols('class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, SymbolKind.Class);
      assert.equal(token.params.length, 0);
    });

    test('should parse abstract class', () => {
      const token = parser.getSymbols('abstract class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, SymbolKind.Class);
      assert.equal(token.params.length, 0);
    });
  });
});
