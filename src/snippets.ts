import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  Position,
  Range,
  SnippetString,
  TextDocument,
  window,
} from 'vscode';

import { Parser } from './parser';

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
   * @inheritdoc
   */
  public provideCompletionItems(
    document: TextDocument,
    position: Position,
  ): CompletionItem[] {
    const result: CompletionItem[] = [];

    // Check for `/**` before attempting to generate docblocks
    if (this.getWordRange(document, position, /\/\*\*/)) {
      // Create new auto-completion item
      const item = new CompletionItem('/**', CompletionItemKind.Snippet);

      // Replace the currently selected line
      item.range = document.lineAt(position).range;

      // Send the currently active text editor to generate the docblock
      const docBlock = this.parser.init(window.activeTextEditor);

      item.insertText = new SnippetString(docBlock);
      item.detail = 'VS DocBlockr';

      result.push(item);
    }
    return result;
  }

  /**
   * Get a word range at the specified position
   *
   * Shortcut for `document.getWordRangeAtPosition`
   *
   * @param   {TextDocument}  document  The document in which the command was
   *                                    invoked.
   * @param   {Position}      position  The position at which the command was
   *                                    invoked.
   * @param   {RegExp}        regex     Expression to check against
   *
   * @return  {Range}                   Range of the text from the editor
   */
  private getWordRange(
    document: TextDocument,
    position: Position,
    regex: RegExp,
  ): Range {
    return document.getWordRangeAtPosition(position, regex);
  }
}
