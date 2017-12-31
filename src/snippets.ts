import { 
  CancellationToken,
  CompletionItem, 
  CompletionItemKind, 
  CompletionItemProvider, 
  Position,
  Range,
  SnippetString, 
  ProviderResult,
  TextDocument,
  TextEditor,
  window
} from 'vscode';
import { Parser } from './parser';

export interface Snippet {
  name:    string,
  snippet: string,
}

export class Snippets implements CompletionItemProvider {
  protected editor: TextEditor = window.activeTextEditor;
  protected parser: Parser;
  protected snippets: Array<Snippet>;
  
  public constructor(parser: Parser) {
    this.parser = parser;
  }

  private getWordRange(
    document: TextDocument, 
    position: Position, 
    regex:    RegExp): Range {
    return document.getWordRangeAtPosition(position, regex);
  }

  private checkPosition(
    document: TextDocument, 
    position: Position, 
    regex:    RegExp): boolean {
    return this.getWordRange(document, position, regex) !== undefined;
  }

  public provideCompletionItems(
    document: TextDocument,
    position: Position,
    token:    CancellationToken
  ): Array<CompletionItem> {
    let result: Array<CompletionItem> = [];
    let blockRegex = /\/\*\*/;
    let paramRegex = /\@[a-z]*/;
    let match: Range;

    if (this.checkPosition(document, position, blockRegex)) {
      match = this.getWordRange(document, position, blockRegex);
      let blockString = this.parser.init(this.editor);
      let block = new CompletionItem("/**", CompletionItemKind.Snippet);
      let range = this.getWordRange(document, position, /\/\*\* \*\//);
      // console.log(range);
      block.range = range;
      block.insertText = new SnippetString(this.parser.init(this.editor));
      result.push(block);
      return result;
    } else if (!this.checkPosition(document, position, paramRegex)) {
      console.log('no match');
      return result;
    }
    let search = document.getText(match);
    let potential = this.snippets.filter((snippet) => {
      return snippet.name.match(search) !== null;
    });
    potential.forEach(tag => {
      let item = new CompletionItem(tag.name, CompletionItemKind.Snippet);
      item.range = match;
      item.insertText = new SnippetString(tag.snippet);
      console.log([item, tag.name, CompletionItemKind.Snippet])
      result.push(item);
    });
    return result;
  }
}