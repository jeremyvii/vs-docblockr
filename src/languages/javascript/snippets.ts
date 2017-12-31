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

export class JavaScriptSnippets extends Snippets {
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

  public constructor() {
    super(new JavaScript());
  }
}