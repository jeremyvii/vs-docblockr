import { 
  TextDocument,
  CancellationToken,
  CompletionItem, 
  CompletionItemKind, 
  CompletionItemProvider, 
  Position,
  Range,
  SnippetString, 
  ProviderResult
} from 'vscode';

export interface Snippet {
  name:    string,
  snippet: string,
}

export class Snippets implements CompletionItemProvider {
  protected snippets: Array<Snippet>;
  
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
      console.log(match);
      console.log('parse docblock');
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