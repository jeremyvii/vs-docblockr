/**
 * Tests specific to parsing the Java language
 */

import { Java } from '../../src/languages/java';

import * as assert from 'assert';
import { SymbolKind } from 'vscode';

// Get parser instance
const parser = new Java();

suite('Java', () => {
  suite('tokenize', () => {
    test('should parse variable', async () => {
      const token = await parser.tokenize('int foo = 5;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Variable);
      assert.equal(token.varType, 'int');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse undefined variable', async () => {
      const token = await parser.tokenize('boolean foo;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Variable);
      assert.equal(token.varType, 'boolean');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse function', async () => {
      const token = await parser.tokenize('public void foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'void');
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', async () => {
      const token = await parser.tokenize('public void foo(int arg1, int arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `arg${Number(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, 'int');
        }
      }
      assert.equal(token.return.present, true);
    });

    test('should parse function with multiple modifiers', async () => {
      const token = await parser.tokenize('public static void foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, SymbolKind.Function);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'void');
      assert.equal(token.return.present, true);
    });

    test('should parse class', async () => {
      const token = await parser.tokenize('class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, SymbolKind.Class);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse abstract class', async () => {
      const token = await parser.tokenize('abstract class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, SymbolKind.Class);
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });
  });
});
