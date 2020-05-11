import * as assert from 'assert';
import { commands, Selection, SnippetString, TextDocument, TextEditor } from 'vscode';

import TestEditor from './TestEditor';

suite('Snippets', () => {
  suite('Keybinding: /** + Enter', () => {
    let editor: TextEditor;
    let document: TextDocument;

    suiteSetup((done) => {
      TestEditor.loadEditor('typescript', (textEditor, textDocument) => {
        editor = textEditor;
        document = textDocument;

        done();
      });
    });

    test('should parse from keybinding', async () => {
      await editor.insertSnippet(new SnippetString('\nfunction foo() {}'));

      const selection = new Selection(0, 0, 0, 0);

      editor.selection = selection;

      assert.ok(document.validateRange(selection));

      editor.insertSnippet(new SnippetString('/**\n')).then(() => {
        const actual = document.getText();

        const expected = [
          '/**',
          ' * [foo description]',
          ' *',
          ' * @return  {[type]}       [return description]',
          ' */',
          'function foo(bar) {}',
        ].join('\n');

        assert.strictEqual(actual, expected);
      });
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

      const selection = new Selection(0, 0, 0, 18);

      editor.selection = selection;

      assert.ok(document.validateRange(selection));

      commands.executeCommand('vs-docblockr.renderFromSelection').then(() => {
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
});
