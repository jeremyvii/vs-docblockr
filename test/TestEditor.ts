import { TextDocument, TextEditor, window, workspace } from 'vscode';

/**
 * Provides helper methods for testing the editor
 */
export default class TestEditor {
  /**
   * Load an untitlied text editor
   */
  public static loadEditor(callback: (editor: TextEditor, document: TextDocument) => void) {
    workspace.openTextDocument().then((textDocument) => {
      window.showTextDocument(textDocument).then((textEditor) => {
        callback.call(this, textEditor, textDocument);
      }, (error) => {
        // tslint:disable-next-line: no-console
        console.log(error);
      });
    }, (error) => {
      // tslint:disable-next-line: no-console
      console.log(error);
    });
  }
}
