/**
 * Extension entry point
 */

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, Disposable, ExtensionContext, languages, StatusBarAlignment, 
  StatusBarItem, TextDocument }     from 'vscode';
import { JavaScriptSnippets   }     from './languages/javascript/snippets'; 


export function activate(context: ExtensionContext) {
  // Get editor object
  let editor = window.activeTextEditor;
  // Get current language ID
  let language = editor.document.languageId;
  // Instantiate docblock parser as null
  let Parser = null;
  // Helper function for registering completion item proivder
  let register = function(language, snippet) {
    languages.registerCompletionItemProvider(language, snippet, '*', '@');
  }
  // Determine language
  if (!language) {
    console.log(language);
  } else if (language === 'javascript') {
    register(language, new JavaScriptSnippets());
  }
}

export function deactivate() {
}
