/**
 * Extension entry point
 */

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, Disposable, ExtensionContext, languages, 
  StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';
// Handles the '/** + enter' action before the code parsing begins
import { Snippets }   from './snippets';
// Get code parsers
import { Parser }     from './parser';
import { JavaScript } from './languages/javascript';
import { PHP }        from './languages/php';
import { TypeScript } from './languages/typescript';

export function activate(context: ExtensionContext) {
  // Get editor object
  let editor = window.activeTextEditor;
  // Get current language ID
  let language = editor.document.languageId;
  // Associative list of allowed languages
  // Scheme as follows: 
  //   language ID: class name
  let langList = {
    'javascript': JavaScript,
    'php': PHP,
    'typescript': TypeScript
  };
  // Register each language
  for (let language in langList) {
    // Get language parser object from list
    let parser: Parser = new langList[language]();
    // Create snippet object with the parser above
    let snippet = new Snippets(parser);
    // Register docblockr auto completition
    languages.registerCompletionItemProvider(language, snippet, '*', '@');
  }
}

export function deactivate() {
}
