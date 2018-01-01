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
   * List of auto-complete snippets
   */
  protected snippets: Array<Snippet> = [
    {
      name:    '@param',
      snippet: '@param   {${1:mixed}}  ${2:name}  ${3:description}'
    },
    {
      name:    '@return',
      snippet: '@return  {${1:mixed}}             ${2:description}'
    }
  ];

  /**
   * Get instance of JavaScript code parser
   */
  public constructor() {
    super(new JavaScript());
  }
}