/**
 * Extension entry point
 */

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, LanguageConfiguration } from 'vscode';

// Handles the '/** + enter' action before the code parsing begins
import { Snippets } from './snippets';

// Main parser class
import { Parser } from './parser';

// Language specific code parsers
import { Java } from './languages/java';
import { JavaScript } from './languages/javascript';
import { PHP } from './languages/php';
import { Scss } from './languages/scss';
import { TypeScript } from './languages/typescript';
import { Rules } from './rules';

export function activate(context: ExtensionContext) {
  // Associative list of allowed languages
  // Scheme as follows:
  //   language ID: class name
  const langList = {
    java: Java,
    javascript: JavaScript,
    php: PHP,
    scss: Scss,
    typescript: TypeScript,
  };
  // Register each language
  for (const language in langList) {
    if (langList.hasOwnProperty(language)) {
      // Get language parser object from list
      const parser: Parser = new langList[language]();
      // Create snippet object with the parser above
      const snippet = new Snippets(parser);
      // Register docblockr auto competition
      let disposable = languages.registerCompletionItemProvider(language, snippet, '*', '@');
      context.subscriptions.push(disposable);
      // List of classes that doesn't have docblock auto-completion supported
      const autoComplete = [
        'java',
        'scss'
      ];
      if (autoComplete.some((item) => item === language)) {
        // Create language configuration object for adding enter rules
        const config: LanguageConfiguration = {
          onEnterRules: []
        }
        // Pull enter rules defined by Rules object to autocomplete *
        Rules.enterRules.map((rule) => {
          config.onEnterRules.push(rule);
        });
        // Set up configuration per language
        disposable = languages.setLanguageConfiguration(language, config);
        context.subscriptions.push(disposable);
      }
    }
  }
}
