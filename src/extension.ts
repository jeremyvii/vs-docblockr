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

export function activate(context: ExtensionContext) {
  let disposables: Array<Disposable> = [];
  // Get editor object
  let editor = window.activeTextEditor;
  // Get current language ID
  let language = editor.document.languageId;
  // Instantiate docblock parser as null
  let Parser = null;
  // Associative list of allowed languages
  // Scheme as follows: 
  //   language ID: class name
  let langList = {
    'javascript': JavaScript,
    'php': PHP
  };
  // Register each language
  for (let language in langList) {
    // Get language parser object from list
    let parser = new langList[language]();
    // Create snippet object with the parser above
    let snippet = new Snippets(parser);
    // Register docblockr auto completition
    context.subscriptions.push(
      languages.registerCompletionItemProvider(language, snippet, '*', '@'));
  }
}

export function deactivate() {
}
