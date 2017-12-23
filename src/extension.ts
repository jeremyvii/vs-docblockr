'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, 
  StatusBarItem, TextDocument}    from 'vscode';
import {DocBlockParser}           from './DocBlockParser';

export function activate(context: ExtensionContext) {
  // Instantiate DocBlock Parser class 
  let docBlockParser = new DocBlockParser();
  
  let disposable = commands.registerCommand('extension.parseFunction', () => {
    docBlockParser.parseFunction(window.activeTextEditor);
  });

  // Add to a list of disposables which are disposed when this extension is 
  // deactivated.
  context.subscriptions.push(disposable);
}

export function deactivate() {
}
