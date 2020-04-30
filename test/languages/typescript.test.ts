/**
 * Tests specific to parsing the TypeScript language
 */

import * as assert from 'assert';
import { TypeScript } from '../../src/languages/typescript';

import { SymbolKind } from 'vscode';

// Get parser instance
const parser = new TypeScript();

suite('TypeScript', () => {
  suite('getSymbols', () => {
    test('should parse variable', () => {
      const token = parser.getSymbols('let foo = 5;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse undefined variable', () => {
      const token = parser.getSymbols('let foo;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse function', () => {
      const token = parser.getSymbols('function foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse function with arguments', () => {
      const token = parser.getSymbols('function foo(arg1, arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);

      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, undefined);
        }
      }
    });

    test('should parse arguments with types defined', () => {
      const token = parser.getSymbols('function foo(arg: number) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);
      assert.strictEqual(token.params[0].name, 'arg');
      assert.strictEqual(token.params[0].type, 'number');
    });

    test('should parse arguments with array type', () => {
      const token = parser.getSymbols('function foo(arg: number[]) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);
      assert.strictEqual(token.params[0].name, 'arg');
      assert.strictEqual(token.params[0].type, 'number[]');
    });

    test('should parse arguments with generic array type', () => {
      const token = parser.getSymbols('function foo(arg: Array<number>) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);
      assert.strictEqual(token.params[0].name, 'arg');
      assert.strictEqual(token.params[0].type, 'Array<number>');
    });

    test('should parse arguments with class type', () => {
      const token = parser.getSymbols('function foo(arg: Bar) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);
      assert.strictEqual(token.params[0].name, 'arg');
      assert.strictEqual(token.params[0].type, 'Bar');
    });

    test('should parse arguments using object destructuring', () => {
      const token = parser.getSymbols('function foo({bar, fizz, buzz}) {');

      assert.strictEqual(token.params.length, 3);
    });

    test('should parse function with return type', () => {
      const token = parser.getSymbols('function foo(): boolean {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse function with array return type', () => {
      const token = parser.getSymbols('function foo(): number[] {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.return.type, 'number[]');
    });

    test('should parse function with generic array return type', () => {
      const token = parser.getSymbols('function foo(): Array<number> {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.return.type, 'Array<number>');
    });

    test('should parse function with class return type', () => {
      const token = parser.getSymbols('function foo(): Bar {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.return.type, 'Bar');
    });

    test('should parse class', () => {
      const token = parser.getSymbols('class Bar {');

      assert.strictEqual(token.name, 'Bar');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse interface as class', () => {
      const token = parser.getSymbols('interface IBar {');

      assert.strictEqual(token.name, 'IBar');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse class method', () => {
      const token = parser.getSymbols('public foo() {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse class method with return type', () => {
      const token = parser.getSymbols('public foo(): number {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 0);
      assert.strictEqual(token.return.type, 'number');
    });

    test('should parse class method argument type', () => {
      const token = parser.getSymbols('public foo(bar: number) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);
      assert.strictEqual(token.params[0].name, 'bar');
      assert.strictEqual(token.params[0].type, 'number');
    });

    test('should parse class property with no value', () => {
      const token = parser.getSymbols('public foo;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse class property with value', () => {
      const token = parser.getSymbols('public foo = 5;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse expression assigned to object property', () => {
      const token = parser.getSymbols('Fizz.buzz.foo = function (bar: number): boolean {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);
      assert.strictEqual(token.params[0].name, 'bar');
      assert.strictEqual(token.params[0].type, 'number');
      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse arrow function', () => {
      const token = parser.getSymbols('const foo = (bar: number, fizz: number): number => bar + fizz;');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      assert.strictEqual(token.params[0].name, 'bar');
      assert.strictEqual(token.params[0].type, 'number');
      assert.strictEqual(token.params[1].name, 'fizz');
      assert.strictEqual(token.params[1].type, 'number');
      assert.strictEqual(token.return.type, 'number');
    });
  });
});
