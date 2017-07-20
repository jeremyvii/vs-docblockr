'use strict';

import {ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, 
  window, Disposable, SnippetString, Position} from 'vscode';

/**
 * Inital Class for parsing Doc Block comments
 */
export class DocBlockParser {
  private _disposable: Disposable;

  /**
   * Parses function and generates doc block for said function
   * 
   * @param  {TextDocument} doc The content of the editor
   * 
   * @return {void} 
   */
  public parseFunction(doc: TextDocument): void { 
    // Ensure lanaguage is javascript
    if (doc.languageId == 'javascript') {
      let docContent = doc.getText();
      let subcriptions: Disposable[] = [];
      // Current position of cursor
      let currPosition = window.activeTextEditor.selections[0].active;
      // Get line below current position
      let nextLine = doc.lineAt(currPosition.line + 1);
      console.log(nextLine);
    }
  }

  /**
   * Generates Regular Expression for parsing function call
   */
  private createRegExp(): RegExp {
    let regEx = new RegExp(/function/, 'i');
    return regEx;
  }

  dispose() {
    this._disposable.dispose();
  }
}