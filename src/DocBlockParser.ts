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
    if (doc.languageId == 'javascript') {
      let docContent = doc.getText();
      let subcriptions: Disposable[] = [];
      let position = window.activeTextEditor.selections[0].active;
      console.log(position);
      window.showInformationMessage(docContent);
    }
  }

  dispose() {
    this._disposable.dispose();
  }
}