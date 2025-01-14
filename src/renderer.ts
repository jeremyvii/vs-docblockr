import { SnippetString, workspace } from 'vscode';
import { SymbolDetails } from './devParser';
import { Settings } from './settings';
import { Utilities } from './utilities';

export class Renderer {
  protected alignTags: boolean;

  protected columnCount: number;

  /**
   * Indicates whether or not the return tag should be always rendered
   */
  protected defaultReturnTag: boolean;

  protected newLinesBetweenTags: boolean;

  /**
   * The settings configuration for the renderer.
   */
  protected settings: Settings;

  protected style: string;

  protected typePlaceholder = '[type]';

  public constructor(languageId: string) {
    const config = workspace.getConfiguration('vs-docblockr', { languageId });

    const commentOpen = config.get<string>('commentOpen');
    const commentClose = config.get<string>('commentClose');
    const separator = config.get<string>('separator');

    this.settings = new Settings({
      commentOpen,
      commentClose,
      separator,
    });
    this.style = config.get<string>('style');

    const workspaceConfig = workspace.getConfiguration('vs-docblockr');

    this.alignTags = workspaceConfig.get('alignTags');
    this.newLinesBetweenTags = workspaceConfig.get('newLinesBetweenTags');
    this.columnCount = workspaceConfig.get('columnSpacing');
    this.defaultReturnTag = workspaceConfig.get('defaultReturnTag');
  }

  /**
   * Renders a snippet string for the given symbol details.
   *
   * @param symbolDetails - The details of the symbol to render.
   *
   * @returns A SnippetString containing the rendered symbol details.
   */
  public render(symbolDetails: SymbolDetails): SnippetString {
    const snippet = new SnippetString(this.settings.commentOpen + this.settings.eos);

    snippet
      .appendText(this.settings.separator)
      .appendPlaceholder(`[${symbolDetails.symbol.name} description]`);

    this.renderParamTags(symbolDetails, snippet);
    this.renderReturnTag(symbolDetails, snippet);
    this.renderVarTag(symbolDetails, snippet);

    snippet.appendText(this.settings.eos + this.settings.commentClose);

    return snippet;
  }

  /**
   * Renders parameter tag template for docblock
   *
   * @param snippet - The snippet to process
   * @param typeSpace - Spaces between parameter's tag and type
   * @param type - The parameter's type
   * @param nameSpace - Spaces between parameter's type and name
   * @param name - The parameter's name binding
   * @param descSpace - Spaces between parameter's name and description
   * @param desc - The parameter's description
   */
  protected addParamTag(
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
    } else if (this.style === 'tsdoc') {
      snippet
        .appendText(this.settings.separator)
        .appendText('@param ')
        .appendText(name)
        .appendText(' - ')
        .appendPlaceholder(desc);
    } else {
      snippet
        .appendText(this.settings.separator)
        .appendText(`@param${typeSpace}`)
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
   * Renders return tag with return type and computed spacing
   *
   * @param snippet - The snippet string add the tag to
   * @param typeSpacing - The spacing before the return type
   * @param type - The return tag type
   * @param spacing - Spacing between type and description
   * @param desc - The return description
   */
  protected addReturnTag(snippet: SnippetString, typeSpacing: string, type: string, spacing: string, desc: string): void {
    if (this.style === 'drupal') {
      snippet
        .appendText(this.settings.separator)
        .appendText('@return ')
        .appendText('{')
        .appendPlaceholder(type)
        .appendText('}')
        .appendText(`${this.settings.eos}${this.settings.separator}  `)
        .appendPlaceholder(desc);
    } else if (this.style === 'tsdoc') {
      snippet
        .appendText(this.settings.separator)
        .appendText('@returns ')
        .appendPlaceholder(desc);
    } else {
      snippet
        .appendText(this.settings.separator)
        .appendText('@return')
        .appendText(typeSpacing)
        .appendText('{')
        .appendPlaceholder(type)
        .appendText('}')
        .appendText(spacing)
        .appendPlaceholder(desc);
    }
  }


  /**
   * Renders a variable tag
   *
   * @param snippet - The snippet to apply the tag to
   * @param type - The variable's type
   */
  protected addVarTag(snippet: SnippetString, type: string): void {
    snippet
      .appendText(`${this.settings.separator}@var `)
      .appendText('{')
      .appendPlaceholder(type)
      .appendText('}');
  }

  /**
   * Generates a string consisting of a specified number of spaces.
   *
   * @param count - The number of spaces to generate. If less than 1, it
   *                defaults to 1.
   *
   * @returns A string containing the specified number of spaces.
   */
  protected generateSpacing(count: number): string {
    if (count < 1) {
      count = 1;
    }

    if (!this.alignTags) {
      count = 2;
    }

    return Array(count).join(' ');
  }

  /**
   * Finds the longest value property value of property provided
   *
   * Used for spacing out docblock segments per line
   *
   * @param symbolDetails - The tokenized code.
   * @param property - The token property to calculate
   *
   * @returns The longest token value of property provided
   */
  protected maxParams(symbolDetails: SymbolDetails, property: string): number {
    const params: number[] = symbolDetails.parameters
      .filter((param) => param[property])
      .map((param) => param[property].length);

    if (property === 'type' && symbolDetails.returnType) {
      params.push(symbolDetails.returnType.length);
    }

    return params.length ?
      Math.max(...params) : (property === 'type' ? this.typePlaceholder.length : this.columnCount);
  }

  /**
   * Renders parameter tags for docblock
   *
   * @param symbolDetails - Tokenized code
   * @param snippet - List of docblock lines
   */
  protected renderParamTags(symbolDetails: SymbolDetails, snippet: SnippetString): void {
    if (!Utilities.isFunction(symbolDetails.symbol) || !symbolDetails.parameters) {
      return;
    }

    if (this.newLinesBetweenTags) {
      snippet.appendText(this.settings.eos + this.settings.separator);
    }

    const hasType = symbolDetails.parameters.some((param) => 'type' in param);
    const typeDiff = this.maxParams(symbolDetails, 'type');
    const nameDiff = this.maxParams(symbolDetails, 'value');

    for (const parameter of symbolDetails.parameters) {
      const type = parameter.type || this.typePlaceholder;
      const name = parameter.value;
      const typeSpacing = this.generateSpacing(this.columnCount + 2);
      const nameOffset = hasType ? typeDiff - type.length + 1 : 1;
      const nameSpacing = this.generateSpacing(this.columnCount + nameOffset);
      const descSpacing = this.generateSpacing(this.columnCount + 1 + nameDiff - name.length);

      snippet.appendText(this.settings.eos);
      this.addParamTag(snippet, typeSpacing, type, nameSpacing, name, descSpacing, `[${name} description]`);
    }
  }

  /**
   * Render return tag for docblock
   *
   * @param symbolDetails - Tokenized code
   * @param snippet - List of docblock lines
   */
  protected renderReturnTag(symbolDetails: SymbolDetails, snippet: SnippetString): void {
    if (!this.defaultReturnTag || !Utilities.isFunction(symbolDetails.symbol)) {
      return;
    }

    const type = symbolDetails.returnType || this.typePlaceholder;
    const typeSpacing = this.generateSpacing(this.columnCount + 1);

    if (this.newLinesBetweenTags) {
      snippet.appendText(this.settings.eos + this.settings.separator);
    }

    snippet.appendText(this.settings.eos);

    const spacing = this.generateSpacing(this.columnCount + this.maxParams(symbolDetails, 'type') - type.length + this.columnCount + this.maxParams(symbolDetails, 'name') + 1);
    const description = '[return description]';

    this.addReturnTag(snippet, typeSpacing, type, spacing, description);
  }

  /**
   * Render var tag for docblock
   *
   * @param symbolDetails - Tokenized code
   * @param snippet - List of docblock lines
   */
  protected renderVarTag(symbolDetails: SymbolDetails, snippet: SnippetString): void {
    // Add special case of variable blocks
    if (Utilities.isVariable(symbolDetails.symbol)) {
      if (this.newLinesBetweenTags) {
        // Empty line
        snippet.appendText(this.settings.eos + this.settings.separator);
      }
      snippet.appendText(this.settings.eos);
      // Format type to be tab-able
      const type = symbolDetails.variableType ?? `[type]`;

      this.addVarTag(snippet, type);
    }
  }
}
