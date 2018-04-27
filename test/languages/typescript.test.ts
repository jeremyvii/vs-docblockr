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
      let token = parser.tokenize('let foo = 5;');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse undefined variable', function () {
      let token = parser.tokenize('let foo;');
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

    test('should parse arguments with types defined', function () {
      let token = parser.tokenize('function foo(arg: number) {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);
      assert.equal(token.params[0].name, 'arg');
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'number');
      assert.equal(token.return.present, true);
    });

    test('should parse function with return type', function () {
      let token = parser.tokenize('function foo(): boolean {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse class', function () {
      let token = parser.tokenize('class Bar {');
      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse class method', function () {
      let token = parser.tokenize('public foo() {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
    });

    test('should parse class method with return type', function () {
      let token = parser.tokenize('public foo(): number {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'number');
    });

    test('should parse class method argument type', function () {
      let token = parser.tokenize('public foo(bar: number) {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);
      assert.equal(token.params[0].name, 'bar');
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'number');
      assert.equal(token.return.present, true);
    });

    test('should parse class property with no value', function () {
      let token = parser.tokenize('public foo;');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse class property with value', function () {
      let token = parser.tokenize('public foo = 5;');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });
  });
});