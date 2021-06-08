import { Token } from 'acorn';
import { SnippetString, SymbolKind, workspace } from 'vscode';

import { Parser } from '../parser';
import { Symbols } from '../symbols';

/**
 * Parses tokens for the SCSS language
 */
export class SCSS extends Parser {
  /**
   * Constructs settings specific to SCSS
   */
  constructor() {
    const config = workspace.getConfiguration('vs-docblockr');

    super({
      commentClose: config.get('scssCommentClose'),
      commentOpen: config.get('scssCommentOpen'),
      grammar: {
        class: ['class'],
        function: ['function'],
        identifier: '[a-zA-Z_$0-9]',
        modifiers: [],
        types: [],
        variables: [],
      },
      separator: config.get('scssCommentSeparator'),
    });
  }

  /**
   * @inheritdoc
   */
  public addParamTag(
    snippet: SnippetString,
    typeSpace: string,
    type: string,
    nameSpace: string,
    name: string,
    descSpace: string,
    desc: string,
  ): void {
    if (this.style === 'drupal') {
      snippet
        .appendText(this.settings.separator)
        .appendText('@param ')
        .appendText('{')
        .appendPlaceholder(type)
        .appendText('}')
        .appendText(' ')
        .appendText(name)
        .appendText(this.settings.eos)
        .appendText(this.settings.separator)
        .appendText('  ')
        .appendPlaceholder(desc);
    } else {
      snippet
        .appendText(this.settings.separator)
        .appendText(`@param${typeSpace} `)
        .appendText('{')
        .appendPlaceholder(type)
        .appendText('}')
        .appendText(nameSpace)
        .appendText(name)
        .appendText(descSpace)
        .appendPlaceholder(desc);
    }
  }

  /**
   * @inheritdoc
   */
  public addReturnTag(snippet: SnippetString, type: string, spacing: string, desc: string): void {
    if (this.style === 'drupal') {
      snippet
        .appendText(this.settings.separator)
        .appendText('@return ')
        .appendText('{')
        .appendPlaceholder(type)
        .appendText('}')
        .appendText(`${this.settings.eos}${this.settings.separator}  `)
        .appendPlaceholder(desc);
    } else {
      snippet
        .appendText(this.settings.separator)
        .appendText('@return')
        .appendText(this.columns)
        .appendText('{')
        .appendPlaceholder(type)
        .appendText('}')
        .appendText(spacing)
        .appendPlaceholder(desc);
    }
  }

  /**
   * @inheritdoc
   */
  public getSymbols(code: string): Symbols {
    // Strip leading @ characters, as these will break acorn tokenization
    code = code.replace('@', '');

    return super.getSymbols(code);
  }

  /**
   * @inheritdoc
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseClass(token: Token, symbols: Symbols): void {
    return;
  }

  /**
   * @inheritdoc
   */
  protected parseFunction(token: Token, symbols: Symbols): void {
    // Check if the token represents a function identifier
    if (this.grammar.is(token.value, 'function')) {
      symbols.type = SymbolKind.Function;

      this.expectName = true;

      return;
    }

    // Check for function name
    if (this.expectName && symbols.type === SymbolKind.Function) {
      symbols.name = token.value;

      this.expectName = false;
    }
  }

  /**
   * @inheritdoc
   */
  protected parseParameters(token: Token, symbols: Symbols): void {
    if (symbols.type === SymbolKind.Function) {
      // If an opening parenthesis occurs, expect the next tokens to represent
      // parameters
      if (token.type.label === '(') {
        this.expectParameter = true;
      }

      if (this.expectParameter && token.value) {
        // Add token's to the parameter list if they match the language
        // identifier
        const parameterExpression = new RegExp(`(${this.grammar.identifier}+)`);

        if (parameterExpression.test(token.value)) {
          symbols.params.push({
            name: token.value,
            val: '',
          });
        }
      }

      if (token.type.label === ')') {
        this.expectParameter = false;
      }
    }
  }

  /**
   * @inheritdoc
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseVariable(token: Token, symbols: Symbols): void {
    return;
  }
}
