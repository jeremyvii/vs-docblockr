'use strict';

import {ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, 
  window, Disposable, SnippetString, Position} from 'vscode';

/**
 * Inital Class for parsing Doc Block comments
 */
export class DocBlockParser {
  /**
   * Things to get rid of when we are done
   * 
   * @var {Disposable}
   */
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
      console.log(this.createRegExp(nextLine.text));
    }
  }

  /**
   * Generates Regular Expression for parsing function call
   * 
   * @NOTE: (function)\s([a-zA-Z0-9]+)\(([a-zA-Z0-9]+)\)
   */
  private createRegExp(line: string): object {
    let functionRegEx = new RegExp(/(function)\s([a-zA-Z0-9]+)/, 'i');
    let argsRegEx;
    return {
      function: functionRegEx.exec(line)[2],
      argsRegEx: 'One day this will have arguments!'
    };
  }

  dispose() {
    this._disposable.dispose();
  }
}