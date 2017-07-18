'use strict';

import {ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, window} from 'vscode';

/**
 * Inital Class for parsing Doc Block comments
 */
export class DocBlockParser {

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
    }
  }
}