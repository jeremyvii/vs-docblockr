import {
  commands,
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  Position,
  Selection,
  TextDocument,
  TextEditor,
  window,
} from 'vscode';

import { Parser as OldParser } from './parser';

import { C } from './languages/c';
import { Java } from './languages/java';
import { PHP } from './languages/php';
import { SCSS } from './languages/scss';
import { TypeScript } from './languages/typescript';
import { DevParser as Parser } from './devParser';
import { Renderer } from './renderer';

/**
 * Snippet handler
 *
 * Used as a communication layer between visual studio code and the DocBlockr
 * parser
 */
export class Snippets implements CompletionItemProvider {
  /**
   * A map of language ID's and language specific parsers
   */
  public static languageList = {
    c: C,
    cpp: C,
    java: Java,
    javascript: TypeScript,
    php: PHP,
    scss: SCSS,
    typescript: TypeScript,
    vue: TypeScript,
  };

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
   * @param parser - Code parser
   */
  public constructor(parser?: Parser) {
    this.parser = parser;
  }

  /**
   * {@inheritdoc}
   */
  public async provideCompletionItems(document: TextDocument, position: Position): Promise<CompletionItem[]> {
    const result: CompletionItem[] = [];

    // Attempt to determine auto-completion range by checking for opening `/**`
    // (and optional closing ` */`)
    const range = document.getWordRangeAtPosition(position, /\/\*\*(?: \*\/)?/);

    // Ensure completion range was found before attempting to generate docblocks
    if (range !== undefined) {
      // Create new auto-completion item
      const item = new CompletionItem('/**', CompletionItemKind.Snippet);

      const { selection } = window.activeTextEditor;
      const currentPosition = new Position(selection.active.line + 1, 0);

      const parser = new Parser(document);
      const symbolDetails = await parser.parse(currentPosition);
      const renderer = new Renderer(document.languageId);

      // Replace the currently selected line
      item.range = range;

      item.insertText = renderer.render(symbolDetails);
      item.detail = 'VS DocBlockr';

      result.push(item);
    }

    return result;
  }

  /**
   * Retrieve a language parser instance based on the provide language ID
   *
   * @param language - The provided language ID
   *
   * @returns A language specific parser instance
   */
  public static getParserFromLanguageID(language: string): OldParser {
    if (!Object.prototype.hasOwnProperty.call(Snippets.languageList, language)) {
      throw new Error(`This language is not supported: ${language}`);
    }

    return new Snippets.languageList[language](language) as OldParser;
  }

  /**
   * Provides a docblock snippet when rendering from selection
   *
   * @param editor - The currently active text editor
   */
  public static async provideRenderFromSelectionSnippet(editor: TextEditor): Promise<void> {
    // Retrieve the current selection from the editor
    const { selection } = editor;

    // Determine the current language being used
    const { document } = editor;

    const parser = new Parser(document);
    const symbolDetails = await parser.parse(selection.active);
    const renderer = new Renderer(document.languageId);

    // Render a docblock from the selection
    const block = renderer.render(symbolDetails);

    // Ensure the selection ends at the top of the function signature
    // This is unideal but seems to be the best way to generating snippets
    // from a selection without modifying the selected code
    editor.selection = Snippets.reverseMultiLinedSelection(selection);

    await commands.executeCommand('editor.action.insertLineBefore');

    editor.insertSnippet(block);
  }

  /**
   * Reverse the provided selection if it has multiple lines
   *
   * @param selection -  The selection to reverse
   *
   * @returns The reserved selection
   */
  protected static reverseMultiLinedSelection(selection: Selection): Selection {
    if (selection.isSingleLine || selection.isReversed) {
      return selection;
    }

    return new Selection(selection.active, selection.anchor);
  }
}
