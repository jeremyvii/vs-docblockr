/**
 * Tests specific to parsing the TypeScript language
 */

import * as assert from 'assert';
import { TypeScript } from '../../src/languages/typescript';

// Get parser instance
const parser = new TypeScript();

suite('TypeScript', () => {
  suite('tokenize', () => {
    test('should parse variable', () => {
      const token = parser.tokenize('let foo = 5;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse undefined variable', () => {
      const token = parser.tokenize('let foo;');

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
          assert.equal(token.params[i].name, `arg${Number(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, undefined);
        }
      }
      assert.equal(token.return.present, true);
    });

    test('should parse arguments with types defined', () => {
      const token = parser.tokenize('function foo(arg: number) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);
      assert.equal(token.params[0].name, 'arg');
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'number');
      assert.equal(token.return.present, true);
    });

    test('should parse arguments with array type', () => {
      const token = parser.tokenize('function foo(arg: number[]) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);
      assert.equal(token.params[0].name, 'arg');
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'number[]');
      assert.equal(token.return.present, true);
    });

    test('should parse arguments using object destructuring', () => {
      const token = parser.tokenize('function foo({bar, fizz, buzz}) {');

      assert.equal(token.params.length, 3);
    });

    test('should parse function with return type', () => {
      const token = parser.tokenize('function foo(): boolean {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });

    test('should parse function with array return type', () => {
      const token = parser.tokenize('function foo(): Array<number> {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'Array<number>');
    });

    test('should parse class', () => {
      const token = parser.tokenize('class Bar {');

      assert.equal(token.name, 'Bar');
      assert.equal(token.type, 'class');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse class method', () => {
      const token = parser.tokenize('public foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
    });

    test('should parse class method with return type', () => {
      const token = parser.tokenize('public foo(): number {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'number');
    });

    test('should parse class method argument type', () => {
      const token = parser.tokenize('public foo(bar: number) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);
      assert.equal(token.params[0].name, 'bar');
      assert.equal(token.params[0].val, '');
      assert.equal(token.params[0].type, 'number');
      assert.equal(token.return.present, true);
    });

    test('should parse class property with no value', () => {
      const token = parser.tokenize('public foo;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse class property with value', () => {
      const token = parser.tokenize('public foo = 5;');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'variable');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, false);
    });

    test('should parse expression assigned to object property', () => {
      const token = parser.tokenize('Fizz.buzz.foo = function (bar: number): boolean {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, 'function');
      assert.equal(token.params.length, 1);
      assert.equal(token.params[0].name, 'bar');
      assert.equal(token.params[0].type, 'number');
      assert.equal(token.return.present, true);
      assert.equal(token.return.type, 'boolean');
    });
  });
});
