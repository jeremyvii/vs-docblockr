/**
 * Tests specific to parsing the PHP language
 */

import * as assert    from 'assert';
import { PHP }        from '../../src/languages/php';

// Get parser instance
let parser = new PHP();

suite('PHP', function () {
  suite('tokenize', function () {
    test('should parse variable', function () {
      let token = parser.tokenize('$foo = 5');
      assert.equal(token.name, '$foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse function', function () {
      let token = parser.tokenize('function foo() {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', function () {
      let token = parser.tokenize('function foo($arg1, $arg2) {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (let i in token.params) {
        assert.equal(token.params[i].name, `$arg${parseInt(i) + 1}`);
        assert.equal(token.params[i].val, '');
        assert.equal(token.params[i].type, undefined);
      }
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments passed by reference', function () {
      let token = parser.tokenize('function foo(int &$arg): boolean {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);

      assert.equal(token.params[0].name, `&$arg`);
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'int');

      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse defined argument type', function () {
      let token = parser.tokenize('function foo(int $bar = 0) {');
      assert.equal(token.params[0].name, '$bar');
      assert.equal(token.params[0].type, 'int');
      assert.equal(token.params[0].val, '0');
    });

    test('should parse defined return type', function () {
      let token = parser.tokenize('function foo(): boolean {');
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse class name as return type', function () {
      let token = parser.tokenize('function foo(): TestClass {');
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'TestClass');
    });

    test('should parse class', function () {
      let token = parser.tokenize('class Bar {');
      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse class method', function () {
      let token = parser.tokenize('public function foo($arg1, $arg2) {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (let i in token.params) {
        assert.equal(token.params[i].name, `$arg${parseInt(i) + 1}`);
        assert.equal(token.params[i].val, '');
        assert.equal(token.params[i].type, undefined);
      }
      assert.equal(token.return.present, true);
    });

    test('should parse class method argument type', function () {
      let token = parser.tokenize('public function foo(string $arg1, stdClass $arg2) {');
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

    test('should parse class method with return type', function () {
      let token = parser.tokenize('public function foo($arg1, $arg2): boolean {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (let i in token.params) {
        assert.equal(token.params[i].name, `$arg${parseInt(i) + 1}`);
        assert.equal(token.params[i].val, '');
        assert.equal(token.params[i].type, undefined);
      }
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse class method with type defined arguments', function () {
      let token = parser.tokenize('public function foo(int $arg): boolean {');

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