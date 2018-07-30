/**
 * Extension entry point
 */

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, ExtensionContext, languages } from 'vscode';
// Handles the '/** + enter' action before the code parsing begins
import { Snippets } from './snippets';
// Get code parsers
import { Parser } from './parser';
import { C } from './languages/c';
import { JavaScript } from './languages/javascript';
import { PHP } from './languages/php';
import { TypeScript } from './languages/typescript';

export function activate(context: ExtensionContext) {
  // Get editor object
  const editor = window.activeTextEditor;
  // Associative list of allowed languages
  // Scheme as follows: 
  //   language ID: class name
  const langList = {
    'c': C,
    'javascript': JavaScript,
    'php': PHP,
    'typescript': TypeScript
  };
  // Register each language
  for (const language in langList) {
    // Get language parser object from list
    const parser: Parser = new langList[language]();
    // Create snippet object with the parser above
    const snippet = new Snippets(parser);
    // Register docblockr auto competition
    languages.registerCompletionItemProvider(language, snippet, '*', '@');
  }
}

export function deactivate() {
}
