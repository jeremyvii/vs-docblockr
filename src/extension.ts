import { commands, ExtensionContext, LanguageConfiguration, languages } from 'vscode';

import { Rules } from './rules';
import { Snippets } from './snippets';

/**
 * Activates the extension
 *
 * @param  {ExtensionContext}  context  The extension context
 */
export function activate(context: ExtensionContext): void {
  registerCompletionItems(context);

  const command = 'vs-docblockr.renderFromSelection';

  commands.registerTextEditorCommand(command, Snippets.provideRenderFromSelectionSnippet);
}

/**
 * Register completion items for each supported language
 *
 * @param  {ExtensionContext}  context  The extension context
 */
function registerCompletionItems(context: ExtensionContext) {
  // Register each language
  for (const language in Snippets.languageList) {
    if (Object.prototype.hasOwnProperty.call(Snippets.languageList, language)) {
      // Get language parser object from list
      const parser = Snippets.getParserFromLanguageID(language);
      // Create snippet object with the parser above
      const snippet = new Snippets(parser);

      // Register docblockr auto competition
      let disposable = languages.registerCompletionItemProvider(language, snippet, '*', '@');
      context.subscriptions.push(disposable);

      // List of classes that doesn't have docblock auto-completion supported
      const autoComplete = [
        'java',
        'scss',
      ];

      if (autoComplete.some((item) => item === language)) {
        // Create language configuration object for adding enter rules
        const config: LanguageConfiguration = {
          onEnterRules: [],
        };

        // Apply enter rules
        config.onEnterRules.push(...Rules.enterRules);

        // Set up configuration per language
        disposable = languages.setLanguageConfiguration(language, config);
        context.subscriptions.push(disposable);
      }
    }
  }
}
