import { TextDocument, TextEditor, window, workspace, Range } from 'vscode';

/**
 * Provides helper methods for testing the editor
 */
export default class TestEditor {
  /**
   * Load an untitled text editor
   *
   * @param language - The language mode for the editor
   * @param callback - The callback function to execute after loading the editor
   */
  public static loadEditor(language: string, callback: (editor: TextEditor, document: TextDocument) => void): void {
    workspace.openTextDocument({
      language,
    }).then((textDocument) => {
      window.showTextDocument(textDocument).then((textEditor) => {
        textEditor.options.tabSize = 2;

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
   * @param milliseconds - Number of milliseconds to wait
   *
   * @returns A promise that resolves after the specified delay
   */
  public static delay(milliseconds: number): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  /**
   * Empties the provided text document
   *
   * @param editor - The text editor instance
   */
  public static async clearDocument(editor: TextEditor): Promise<void> {
    const document = editor.document;
    const entireRange = new Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );

    await editor.edit((editBuilder) => {
      editBuilder.delete(entireRange);
    });
  }
}
