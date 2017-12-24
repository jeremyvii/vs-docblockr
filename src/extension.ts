'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, 
  StatusBarItem, TextDocument }     from 'vscode';
import { JavaScript }               from './languages/JavaScript'; 

export function activate(context: ExtensionContext) {
  // Get editor object
  let editor = window.activeTextEditor;
  // Get current language ID
  let language = editor.document.languageId;
  // Instantiate docblock parser as null
  let Parser = null;
  // Determine language
  if (!language) {
    console.log(language);
  } else if (language === 'javascript') {
    Parser = new JavaScript();
  }
  if (Parser !== null) {
    let disposable = commands.registerCommand('extension.parseFunction', () => {
      Parser.parseFunction(editor);
    });
      // Add to a list of disposables which are disposed when this extension is 
    // deactivated.
    context.subscriptions.push(disposable);
  }
}

export function deactivate() {
}
