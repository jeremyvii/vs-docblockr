/**
 * Tests specific to parsing the Java language
 */

import * as assert from 'assert';
import { Java } from '../../src/languages/java';

// Get parser instance
const parser = new Java();

suite('Java', () => {
  suite('tokenize', () => {
    test('should parse variable', () => {
      const token = parser.tokenize('int foo = 5;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.varType, 'int');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse undefined variable', () => {
      const token = parser.tokenize('boolean foo;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.varType, 'boolean');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse function', () => {
      const token = parser.tokenize('public void foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'void');
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', () => {
      const token = parser.tokenize('public void foo(int arg1, int arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
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

    test('should parse function with multiple modifiers', () => {
      const token = parser.tokenize('public static void foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'void');
      assert.equal(token.return.present, true);
    });

    test('should parse class', () => {
      const token = parser.tokenize('class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse abstract class', () => {
      const token = parser.tokenize('abstract class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });
  });
});
