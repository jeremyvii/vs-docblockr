import { TextDocument, TextEditor, window, workspace } from 'vscode';

/**
 * Provides helper methods for testing the editor
 */
export default class TestEditor {
  /**
   * Load an untitled text editor
   */
  public static loadEditor(language: string, callback: (editor: TextEditor, document: TextDocument) => void) {
    workspace.openTextDocument({
      language,
    }).then((textDocument) => {
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

  /**
   * Wait for the desired number of milliseconds
   *
   * @param   {number}   milliseconds  Number of milliseconds to wait
   *
   * @return  {Promise}
   */
  public static delay(milliseconds: number): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}
