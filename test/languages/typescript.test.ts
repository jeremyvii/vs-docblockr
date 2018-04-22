/**
 * Tests specific to parsing the TypeScript language
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { TypeScript } from '../../src/languages/typescript';
import { Tokens } from '../../src/parser';

// Get parser instance
let parser = new TypeScript();

suite('TypeScript', function () {
  suite('tokenize', function() {
    test('should parse variable', function () {
      let token = parser.tokenize('let foo = 5');
      assert.equal(token.name, 'foo');
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
      let token = parser.tokenize('function foo(arg1, arg2) {');
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