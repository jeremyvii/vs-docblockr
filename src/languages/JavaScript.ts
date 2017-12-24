'use strict';

import { ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, 
  window, Disposable, SnippetString, Position } from 'vscode';
import { Parser, Lexed, Param, Parsed } from '../Parser';
import { Settings, Options }            from '../Settings';

export class JavaScript extends Parser {
  constructor() {
    super({
      grammer: {
        function: 'function',
        class: 'class'
      }
    });
  }
}