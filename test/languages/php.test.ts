/**
 * Tests specific to parsing the PHP language
 */

import * as assert from 'assert';
import { PHP } from '../../src/languages/php';

// Get parser instance
const parser = new PHP();

suite('PHP', () => {
  suite('tokenize', () => {
    test('should parse variable', () => {
      const token = parser.tokenize('$foo = 5');

      assert.equal(token.name, '$foo');
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
      const token = parser.tokenize('function foo($arg1, $arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, undefined);
        }
      }
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments passed by reference', () => {
      const token = parser.tokenize('function foo(int &$arg): boolean {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);

      assert.equal(token.params[0].name, `&$arg`);
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'int');

      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse defined argument type', () => {
      const token = parser.tokenize('function foo(int $bar = 0) {');

      assert.equal(token.params[0].name, '$bar');
      assert.equal(token.params[0].type, 'int');
      assert.equal(token.params[0].val, '0');
    });

    test('should parse defined return type', () => {
      const token = parser.tokenize('function foo(): boolean {');

      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse class name as return type', () => {
      const token = parser.tokenize('function foo(): TestClass {');

      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'TestClass');
    });

    test('should parse class', () => {
      const token = parser.tokenize('class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse class method', () => {
      const token = parser.tokenize('public function foo($arg1, $arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, undefined);
        }
      }
      assert.equal(token.return.present, true);
    });

    test('should parse class method argument type', () => {
      const token = parser.tokenize('public function foo(string $arg1, stdClass $arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);

      assert.equal(token.params[0].name, '$arg1');
      assert.equal(token.params[0].val,  '');
      assert.equal(token.params[0].type, 'string');

      assert.equal(token.params[1].name, '$arg2');
      assert.equal(token.params[1].val,  '');
      assert.equal(token.params[1].type, 'stdClass');
      assert.equal(token.return.present, true);
    });

    test('should parse class method with return type', () => {
      const token = parser.tokenize('public function foo($arg1, $arg2): boolean {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, undefined);
        }
      }
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse class method with type defined arguments', () => {
      const token = parser.tokenize('public function foo(int $arg): boolean {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);

      assert.equal(token.params[0].name, `$arg`);
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'int');

      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });
  });
});
