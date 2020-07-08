/**
 * Tests specific to parsing the PHP language
 */

import * as assert from 'assert';
import { commands, Selection, SnippetString, SymbolKind, TextDocument, TextEditor } from 'vscode';

import { PHP } from '../../src/languages/php';
import config from '../defaultConfiguration';
import TestEditor from '../TestEditor';

const parser = new PHP();

parser.style = config.style;
parser.columnCount = config.columnSpacing;

suite('PHP', () => {
  suite('getSymbols', () => {
    test('should parse variable', () => {
      const token = parser.getSymbols('$foo = 5');

      assert.strictEqual(token.name, '$foo');
      assert.strictEqual(token.type, SymbolKind.Variable);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse constant', () => {
      const token = parser.getSymbols('const FOO = 5');

      assert.strictEqual(token.name, 'FOO');
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
      const token = parser.getSymbols('function foo($arg1, $arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, undefined);
        }
      }
    });

    test('should parse function with arguments passed by reference', () => {
      const token = parser.getSymbols('function foo(int &$arg): boolean {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);

      assert.strictEqual(token.params[0].name, `$arg`);
      assert.strictEqual(token.params[0].type, 'int');

      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse function arguments with or without types', () => {
      const token = parser.getSymbols('function foo(int $fizz, $buzz): boolean {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);

      assert.strictEqual(token.params[0].name, `$fizz`);
      assert.strictEqual(token.params[0].type, 'int');
      assert.strictEqual(token.params[1].name, `$buzz`);

      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parameters with types', () => {
      const token = parser.getSymbols('function foo(int $bar) {');

      assert.strictEqual(token.params[0].name, '$bar');
      assert.strictEqual(token.params[0].type, 'int');
    });

    test('should parse defined return type', () => {
      const token = parser.getSymbols('function foo(): boolean {');

      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse class name as return type', () => {
      const token = parser.getSymbols('function foo(): TestClass {');

      assert.strictEqual(token.return.type, 'TestClass');
    });

    test('should parse class', () => {
      const token = parser.getSymbols('class Bar {');

      assert.strictEqual(token.name, 'Bar');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse trait', () => {
      const token = parser.getSymbols('trait Bar {');

      assert.strictEqual(token.name, 'Bar');
      assert.strictEqual(token.type, SymbolKind.Class);
      assert.strictEqual(token.params.length, 0);
    });

    test('should parse class method', () => {
      const token = parser.getSymbols('public function foo($arg1, $arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, undefined);
        }
      }
    });

    test('should parse class method argument type', () => {
      const token = parser.getSymbols('public function foo(string $arg1, stdClass $arg2) {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);

      assert.strictEqual(token.params[0].name, '$arg1');
      assert.strictEqual(token.params[0].type, 'string');

      assert.strictEqual(token.params[1].name, '$arg2');
      assert.strictEqual(token.params[1].type, 'stdClass');
    });

    test('should parse class method with return type', () => {
      const token = parser.getSymbols('public function foo($arg1, $arg2): boolean {');
      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.strictEqual(token.params[i].name, `$arg${Number(i) + 1}`);
          assert.strictEqual(token.params[i].type, undefined);
        }
      }
      assert.strictEqual(token.return.type, 'boolean');
    });

    test('should parse class method with type defined arguments', () => {
      const token = parser.getSymbols('public function foo(int $arg): boolean {');

      assert.strictEqual(token.name, 'foo');
      assert.strictEqual(token.type, SymbolKind.Function);
      assert.strictEqual(token.params.length, 1);

      assert.strictEqual(token.params[0].name, `$arg`);
      assert.strictEqual(token.params[0].type, 'int');

      assert.strictEqual(token.return.type, 'boolean');
    });
  });

  suite('renderBlock', () => {
    test('should render class docblock', () => {
      const token = parser.getSymbols('class Foo {');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[Foo description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should render function docblock', () => {
      const token = parser.getSymbols('function foo($bar) {');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   ${2:[type]}  \\$bar  ${3:[\\$bar description]}',
        ' *',
        ' * @return  ${4:[type]}        ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should render variable docblock', () => {
      const token = parser.getSymbols('public $foo;');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[\\$foo description]}',
        ' *',
        ' * @var ${2:[type]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });
  });

  suite('Keybinding: /** + Enter', () => {
    let editor: TextEditor;
    let document: TextDocument;

    suiteSetup((done) => {
      TestEditor.loadEditor('php', async (textEditor, textDocument) => {
        editor = textEditor;
        document = textDocument;

        done();
      });
    });

    test('should parse parameter-less function', async () => {
      await editor.insertSnippet(new SnippetString('<?php\n\nfunction foo() {}'));

      const selection = new Selection(1, 0, 1, 0);

      editor.selection = selection;

      assert.ok(document.validateRange(selection));

      await editor.insertSnippet(new SnippetString('/**'));

      await commands.executeCommand('editor.action.triggerSuggest');

      await TestEditor.delay(4000);

      await commands.executeCommand('acceptSelectedSuggestion');

      const actual = document.getText();

      const expected = [
        '/**',
        ' * [foo description]',
        ' *',
        ' * @return  [type]  [return description]',
        ' */',
        'function foo() {}',
      ].join('\n');

      assert.strictEqual(actual, expected);
    });

    teardown((done) => {
      editor.edit((builder) => {
        TestEditor.clearDocument(builder, document);

        done();
      });
    });
  });
});
