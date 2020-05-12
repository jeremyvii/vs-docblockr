import * as assert from 'assert';
import { commands, Selection, SnippetString, TextDocument, TextEditor } from 'vscode';

import TestEditor from './TestEditor';

suite('Snippets', () => {
  suite('Keybinding: /** + Enter', () => {
    let editor: TextEditor;
    let document: TextDocument;

    suiteSetup((done) => {
      TestEditor.loadEditor('typescript', async (textEditor, textDocument) => {
        editor = textEditor;
        document = textDocument;

        await editor.insertSnippet(new SnippetString('\nfunction foo(bar) {}'));

        const selection = new Selection(0, 0, 0, 0);

        editor.selection = selection;

        assert.ok(document.validateRange(selection));

        await editor.insertSnippet(new SnippetString('/**'));

        await commands.executeCommand('editor.action.triggerSuggest');

        await TestEditor.delay(3000);

        await commands.executeCommand('acceptSelectedSuggestion');

        done();
      });
    });

    test('should parse from keybinding', async () => {
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
  });

  suite('renderFromSelection', () => {
    let editor: TextEditor;
    let document: TextDocument;

    suiteSetup((done) => {
      TestEditor.loadEditor('typescript', async (textEditor, textDocument) => {
        editor = textEditor;
        document = textDocument;

        await editor.insertSnippet(new SnippetString('function foo(bar) {}'));

        const selection = new Selection(document.positionAt(0), document.positionAt(document.getText().length - 1));

        editor.selection = selection;

        await commands.executeCommand('vs-docblockr.renderFromSelection');

        done();
      });
    });

    test('should parse selected snippet', async () => {
      await TestEditor.delay(2000);

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
  });
});
