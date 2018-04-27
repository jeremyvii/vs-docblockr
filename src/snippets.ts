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
   * Language specific code parser
   * 
   * Handles code parsing, and generates docblock string. The language parser is 
   * determined in `extension.ts`.
   */
  protected parser: Parser;
  
  /**
   * Sets up the parser, instantiated from extension entry point
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
   * Listens for docblock characters, and sends code the `Parser`.
   * 
   * When `/**` is typed the `Parser`, specific to current language, is ran. 
   * The code immediately below the cursor position is the parsed, and docblock 
   * string is returned.
   * 
   * @param   {TextDocument}       document  TextDocument namespace
   * @param   {Position}           position  Position in the editor
   * @param   {CancellationToken}  token     We aren't using this, but is 
   *                                         required upon extending the 
   *                                         `CompletionItemProvider class
   * 
   * @return  {CompletionItem[]}             List of completion items for 
   *                                         auto-completition
   */
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    token:    CancellationToken
  ): CompletionItem[] {
    // Create empty list of auto-completion items
    // This will be returned at the end
    let result: CompletionItem[] = [];
    // Determine if a docblock is being typed by checking if cursor position is
    // proceeding "/**" characters
    if (this.getWordRange(document, position, /\/\*\*/) !== undefined) {
      // Create new auto-completition item
      let item = new CompletionItem("/**", CompletionItemKind.Snippet);
      // Set word range within full docblock
      item.range = this.getWordRange(document, position, /\/\*\* \*\//);
      // Parse the code below the current cursor position and return generated 
      // docblock string
      let docBlock = this.parser.init(window.activeTextEditor);
      // In order for the snippet to display we need to convert it a snippet 
      // string
      item.insertText = new SnippetString(docBlock);
      // Display details for docblock string
      item.detail = "VS DocBlockr";
      // Push auto-completition item to result list
      // Should be the only one in this instance
      result.push(item);
    }
    return result;
  }
}