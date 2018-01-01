/**
 * JavaScript specific snippet handler
 * 
 * Contains list of snippets specific to JavaScript
 */

import { 
  TextDocument,
  CancellationToken,
  CompletionItem, 
  CompletionItemKind, 
  CompletionItemProvider, 
  Position,
  SnippetString, 
  ProviderResult
} from 'vscode';
import { Snippets, Snippet } from '../../snippets';
import { JavaScript } from './parser';

/**
 * JavaScript specific snippet handler
 * 
 * Used as a communication layer between visual studio code and the DocBlockr 
 * parser
 */
export class JavaScriptSnippets extends Snippets {
  /**
   * Get instance of JavaScript code parser
   */
  public constructor() {
    super(new JavaScript());
  }
}