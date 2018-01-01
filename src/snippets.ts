/**
 * Handles snippet auto-completition, and acts as a layer between visual studio 
 * code and the DocBlockr parser
 */

import { CancellationToken, CompletionItem, CompletionItemKind, 
  CompletionItemProvider, Position, Range, SnippetString, ProviderResult, 
  TextDocument, TextEditor, window } from 'vscode';
import { Parser }                    from './parser';

/**
 * Snippet object used for auto-completion 
 */
export interface Snippet {
  name:    string,
  snippet: string,
}

/**
 * Snippet handler
 * 
 * Used as a communication layer between visual studio code and the DocBlockr 
 * parser
 */
export class Snippets implements CompletionItemProvider {
  /**
   * Currently active text editor
   * 
   * Used for letting the parser know which window to maninpulate
   */
  protected editor: TextEditor = window.activeTextEditor;

  /**
   * Code parser
   */
  protected parser: Parser;

  /**
   * List of auto-complete snippets
   */
  protected snippets: Array<Snippet>;
  
  /**
   * Sets up the parser, instantiated from extensions entry point
   * 
   * @param  {parser}  parser  Code parser
   */
  public constructor(parser: Parser) {
    this.parser = parser;
  }

  /**
   * Gets word range at specificed position
   * 
   * Shortcut for `document.getWordRangeAtPosition`
   * 
   * @param   {TextDocument}  document  TextDocument namespace
   * @param   {Position}      position  Position in the editor
   * @param   {RegExp}        regex     Expression to check against
   * 
   * @return  {Range}                   Range of the matched text in the editor
   */
  private getWordRange(
    document: TextDocument, 
    position: Position, 
    regex:    RegExp): Range {
    return document.getWordRangeAtPosition(position, regex);
  }

  /**
   * Checks if word range is valid
   * 
   * @param   {TextDocument}  document  TextDocument namespace
   * @param   {Position}      position  Position in the editor
   * @param   {RegExp}        regex     Expression to check against
   * 
   * @return  {boolean}                 True if word range is defined
   */
  private checkPosition(
    document: TextDocument, 
    position: Position, 
    regex:    RegExp): boolean {
    return this.getWordRange(document, position, regex) !== undefined;
  }

  /**
   * Snippet handler
   * 
   * @param   {TextDocument}             document  TextDocument namespace
   * @param   {Position}                 position  Position in the editor
   * 
   * @return  {Array<CompletitionItem>}            List of completion items for 
   *                                               auto-completition
   */
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    token:    CancellationToken
  ): Array<CompletionItem> {
    // Create empty list of auto-completion items
    // This will be returned at the end
    let result: Array<CompletionItem> = [];
    // Expression for checking for the beginning of the doc block
    let blockRegex = /\/\*\*/;
    // Matched word range
    let match: Range;
    // Check if doc block is being typed
    if (this.checkPosition(document, position, blockRegex)) {
      // Get word range
      match = this.getWordRange(document, position, blockRegex);
      // Create new auto-completition item
      let item = new CompletionItem("/**", CompletionItemKind.Snippet);
      // Set word range within full doc block
      item.range = this.getWordRange(document, position, /\/\*\* \*\//);
      // Parse code and create snippet string
      item.insertText = new SnippetString(this.parser.init(this.editor));
      // Push auto-completition item to result list
      // Should be the only one in this instance
      result.push(item);
      return result;
    }
    return result;
  }
}