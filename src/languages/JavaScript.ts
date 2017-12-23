'use strict';

import { ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, 
  window, Disposable, SnippetString, Position } from 'vscode';
import { DocBlockParser, Lexed, Param, Parsed } from '../DocBlockParser';

export class JavaScript extends DocBlockParser {

}