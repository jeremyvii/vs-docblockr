/**
 * Tests specific to parsing the C language
 */

import * as assert from 'assert';
import { SymbolKind } from 'vscode';
import { C } from '../../src/languages/c';

const parser = new C();

suite('C', () => {
  suite('getSymbols', () => {
    test('should parse variable', () => {
      const token = parser.getSymbols('int foo = 5;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Variable);
      assert.equal(token.varType, 'int');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse undefined variable', () => {
      const token = parser.getSymbols('int foo;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Variable);
      assert.equal(token.varType, 'int');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse function', () => {
      const token = parser.getSymbols('char foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'char');
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', () => {
      const token = parser.getSymbols('int foo(char arg1, char arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `arg${Number(i) + 1}`);
          assert.equal(token.params[i].val, null);
          assert.equal(token.params[i].type, 'char');
        }
      }
      assert.equal(token.return.present, true);
    });

    test('should parse function with multiple modifiers', () => {
      const token = parser.getSymbols('complex static int foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'int');
      assert.equal(token.return.present, true);
    });

    test('should parse struct', () => {
      const token = parser.getSymbols('struct foo {');

      assert.equal(token.name, 'struct');
      assert.equal(token.type, SymbolKind.Class);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse typedef struct', () => {
      const token = parser.getSymbols('typedef struct {');

      assert.equal(token.name, 'struct');
      assert.equal(token.type, SymbolKind.Class);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });
  });
});
