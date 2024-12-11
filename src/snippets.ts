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

import { Parser } from './parser';

import { C } from './languages/c';
import { Java } from './languages/java';
import { PHP } from './languages/php';
import { SCSS } from './languages/scss';
import { TypeScript } from './languages/typescript';

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
  public constructor(parser: Parser) {
    this.parser = parser;
  }

  /**
   * {@inheritdoc}
   */
  public provideCompletionItems(document: TextDocument, position: Position): CompletionItem[] {
    const result: CompletionItem[] = [];

    // Attempt to determine auto-completion range by checking for opening `/**`
    // (and optional closing ` */`)
    const range = document.getWordRangeAtPosition( position, /\/\*\*(?: \*\/)?/);

    // Ensure completion range was found before attempting to generate docblocks
    if (range !== undefined) {
      // Create new auto-completion item
      const item = new CompletionItem('/**', CompletionItemKind.Snippet);

      // Replace the currently selected line
      item.range = range;

      item.insertText = this.parser.init(window.activeTextEditor);
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
  public static getParserFromLanguageID(language: string): Parser {
    if (!Object.prototype.hasOwnProperty.call(Snippets.languageList, language)) {
      throw new Error(`This language is not supported: ${language}`);
    }

    return new Snippets.languageList[language](language) as Parser;
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
    const activeLanguage = window.activeTextEditor.document.languageId;

    // Retrieve a parser instance for the active language
    const parser = Snippets.getParserFromLanguageID(activeLanguage);

    // Render a docblock from the selection
    const block = parser.renderFromSelection(selection);

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
