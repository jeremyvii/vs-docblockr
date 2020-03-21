/**
 * Tests specific to parsing the JavaScript language
 */

import * as assert from 'assert';
import { TypeScript } from '../../src/languages/typescript';

// Get parser instance
const parser = new TypeScript();

suite('JavaScript', () => {
  suite('tokenize', () => {
    test('should parse variable', () => {
      const token = parser.tokenize('let foo = 5');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse undefined variable', () => {
      const token = parser.tokenize('let foo');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse function', () => {
      const token = parser.tokenize('function foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', () => {
      const token = parser.tokenize('function foo(arg1, arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `arg${parseInt(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, undefined);
        }
      }
      assert.equal(token.return.present, true);
    });

    test('should parse class', () => {
      const token = parser.tokenize('class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse prototype function', () => {
      const token = parser.tokenize('Bar.prototype.foo = function(arg1, arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `arg${parseInt(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, undefined);
        }
      }
      assert.equal(token.return.present, true);
    });

    test('should parse expression assigned to object property', () => {
      const token = parser.tokenize('Fizz.buzz.foo = function (bar) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);
      assert.equal(token.params[0].name, 'bar');
      assert.equal(token.return.present, true);
    });
  });
});
