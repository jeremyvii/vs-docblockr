'use strict';
import {Disposable, window} from 'vscode';
import {DocBlockParser}     from './DocBlockParser';

export class DocBlockParserController {
  private _docBlockParser: DocBlockParser;
  private _disposable: Disposable;

  constructor(docBlockParser: DocBlockParser) {
    this._docBlockParser = docBlockParser;

    // subscribe to selection change and editor activation events
    let subscriptions: Disposable[] = [];
    window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
    window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

    // update the counter for the current file
    this._docBlockParser.updateWordCount();

    // create a combined disposable from both event subscriptions
    this._disposable = Disposable.from(...subscriptions);
  }

  dispose() {
    this._disposable.dispose();
  }

  private _onEvent() {
    this._docBlockParser.updateWordCount();
  }
}