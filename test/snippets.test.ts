import * as assert from 'assert';
import { commands, Selection, SnippetString, TextDocument, TextEditor } from 'vscode';

import { Snippets } from '../src/snippets';

import TestEditor from './TestEditor';

suite('Snippets', () => {
  suite('getParserFromLanguageID', () => {
    test('should throw error when fetching an unsupported language', () => {
      assert.throws(() => {
        Snippets.getParserFromLanguageID('haskell');
      } , Error);
    });
  });

  suite('Keybinding: /** + Enter', () => {
    let editor: TextEditor;
    let document: TextDocument;

    suiteSetup((done) => {
      TestEditor.loadEditor('typescript', async (textEditor, textDocument) => {
        editor = textEditor;
        document = textDocument;

        done();
      });
    });

    test('should parse from keybinding', async () => {
      await editor.insertSnippet(new SnippetString('\nfunction foo(bar) {}'));

      const selection = new Selection(0, 0, 0, 0);

      editor.selection = selection;

      assert.ok(document.validateRange(selection));

      await editor.insertSnippet(new SnippetString('/**'));

      await commands.executeCommand('editor.action.triggerSuggest');

      await TestEditor.delay(1500);

      await commands.executeCommand('acceptSelectedSuggestion');

      const actual = document.getText();

      const expected = [
        '/**',
        ' * [foo description]',
        ' *',
        ' * @param   {[type]}  bar  [bar description]',
        ' *',
        ' * @return  {[type]}       [return description]',
        ' */',
        'function foo(bar) {}',
      ].join('\n');

      assert.strictEqual(actual, expected);
    });

    test('should render empty block on valid input', async () => {
      await editor.insertSnippet(new SnippetString('\n@junk {}'));

      const selection = new Selection(0, 0, 0, 0);

      editor.selection = selection;

      assert.ok(document.validateRange(selection));

      await editor.insertSnippet(new SnippetString('/**'));

      await commands.executeCommand('editor.action.triggerSuggest');

      await TestEditor.delay(1500);

      await commands.executeCommand('acceptSelectedSuggestion');

      const actual = document.getText();

      const expected = [
        '/**',
        ' * [description]',
        ' */',
        '@junk {}',
      ].join('\n');

      assert.strictEqual(actual, expected);
    });

    teardown((done) => {
      TestEditor.clearDocument(editor).then(() => done());
    });
  });

  suite('renderFromSelection', () => {
    let editor: TextEditor;
    let document: TextDocument;

    suiteSetup((done) => {
      TestEditor.loadEditor('typescript', (textEditor, textDocument) => {
        editor = textEditor;
        document = textDocument;

        done();
      });
    });

    test('should parse selected snippet', async () => {
      await editor.insertSnippet(new SnippetString('function foo(bar) {}'));

      const selection = new Selection(document.positionAt(0), document.positionAt(document.getText().length - 1));

      editor.selection = selection;

      await commands.executeCommand('vs-docblockr.renderFromSelection');

      await TestEditor.delay(1000);

      const actual = document.getText();

      const expected = [
        '/**',
        ' * [foo description]',
        ' *',
        ' * @param   {[type]}  bar  [bar description]',
        ' *',
        ' * @return  {[type]}       [return description]',
        ' */',
        'function foo(bar) {}',
      ].join('\n');

      assert.strictEqual(actual, expected);
    });

    test('should preserve indention', async () => {
      const snippet = [
        'class Test {',
        '  public foo(bar) {',
        '    return false;',
        '  }',
        '}',
      ].join('\n');

      await editor.insertSnippet(new SnippetString(snippet));

      const selection = new Selection(1, 2, 1, 18);

      editor.selection = selection;

      await commands.executeCommand('vs-docblockr.renderFromSelection');

      await TestEditor.delay(1000);

      const actual = document.getText();

      const expected = [
        'class Test {',
        '  /**',
        '   * [foo description]',
        '   *',
        '   * @param   {[type]}  bar  [bar description]',
        '   *',
        '   * @return  {[type]}       [return description]',
        '   */',
        '  public foo(bar) {',
        '    return false;',
        '  }',
        '}',
      ].join('\n');

      assert.strictEqual(actual, expected);
    });

    test('should preserve indention in multiline function signatures', async () => {
      const snippet = [
        'class Test {',
        '  public foo(',
        '    bar: string,',
        '  ) {',
        '    return !bar;',
        '  }',
        '}',
      ].join('\n');

      await editor.insertSnippet(new SnippetString(snippet));

      const selection = new Selection(1, 2, 3, 0);

      editor.selection = selection;

      await commands.executeCommand('vs-docblockr.renderFromSelection');

      await TestEditor.delay(1000);

      const actual = document.getText();

      const expected = [
        'class Test {',
        '  /**',
        '   * [foo description]',
        '   *',
        '   * @param   {string}  bar  [bar description]',
        '   *',
        '   * @return  {[type]}       [return description]',
        '   */',
        '  public foo(',
        '    bar: string,',
        '  ) {',
        '    return !bar;',
        '  }',
        '}',
      ].join('\n');

      assert.strictEqual(actual, expected);
    });

    teardown((done) => {
      TestEditor.clearDocument(editor).then(() => done());
    });
  });
});
