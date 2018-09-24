/**
 * Tests specific to parsing the Java language
 */

import * as assert    from 'assert';
import { Java } from '../../src/languages/java';

// Get parser instance
let parser = new Java();

suite('Java', function () {
  suite('tokenize', function () {
    test('should parse variable', function () {
      let token = parser.tokenize('int foo = 5;');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.varType, 'int');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse undefined variable', function () {
      let token = parser.tokenize('boolean foo;');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.varType, 'boolean');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse function', function () {
      let token = parser.tokenize('public void foo() {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.type, 'void');
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', function () {
      let token = parser.tokenize('public void foo(int arg1, int arg2) {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (let i in token.params) {
        assert.equal(token.params[i].name, `arg${parseInt(i) + 1}`);
        assert.equal(token.params[i].val, '');
        assert.equal(token.params[i].type, 'int');
      }
      assert.equal(token.return.present, true);
    });

    test('should parse class', function () {
      let token = parser.tokenize('class Bar {');
      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse prototype function', function () {
      let token = parser.tokenize('Bar.prototype.foo = function(arg1, arg2) {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 2);
      for (let i in token.params) {
        assert.equal(token.params[i].name, `arg${parseInt(i) + 1}`);
        assert.equal(token.params[i].val, '');
        assert.equal(token.params[i].type, undefined);
      }
      assert.equal(token.return.present, true);
    });
  });
});