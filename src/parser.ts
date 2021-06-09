import { Token, tokenizer } from 'acorn';
import { Selection, SnippetString, SymbolKind, TextEditor, window, workspace } from 'vscode';

import { Grammar } from './grammar';
import { IOptions, Settings } from './settings';
import { Symbols } from './symbols';

/**
 * Initial Class for parsing Doc Block comments
 */
export abstract class Parser {
  /**
   * Indicates whether or not to align tags in the block comments
   *
   * @var {boolean}
   */
  public alignTags: boolean;

  /**
   * The desired number of docblock columns defined by
   * `vs-docblockr.columnSpacing`
   *
   * @var {number}
   */
  public columnCount: number;

  /**
   * Indicates whether or not the return tag should be always rendered
   *
   * @var {boolean}
   */
  public defaultReturnTag: boolean;

  /**
   * Indicates `getSymbols()` should quit parsing tokens
   *
   * @var {boolean}
   */
  public done = false;

  /**
   * Indicates that the next acorn `Token` should represent a `Symbol` name
   *
   * @var {boolean}
   */
  public expectName = false;

  /**
   * Indicates that the next `Token` should represent a `Symbol` parameter
   *
   * @var {boolean}
   */
  public expectParameter = false;

  /**
   * Indicates that the next `Token` should represent a parameter type
   *
   * @var {boolean}
   */
  public expectParameterType = false;

  /**
   * Indicates that the next `Token` should represent a return type
   *
   * @var {boolean}
   */
  public expectReturnType = false;

  /**
   * The current languages grammar settings
   *
   * @var {Grammar}
   */
  public grammar: Grammar;

  /**
   * Indicates whether or not to add new lines between tags
   *
   * @var {boolean}
   */
  public newLinesBetweenTags: boolean;

  /**
   * Language specific parser settings
   *
   * @var {Settings}
   */
  public settings: Settings;

  /**
   * Block comment style determined by user
   *
   * @var {string}
   */
  public style: string;

  /**
   * Placeholder for when type (parameter or return) isn't present
   *
   * @var {string}
   */
  public typePlaceholder = '[type]';

  constructor(options: IOptions) {
    // Get instance of language settings
    this.settings = new Settings(options);
    this.grammar = this.settings.grammar;

    // Retrieve the extensions configuration from this workspace instance and
    // cache it's values.
    const config = workspace.getConfiguration('vs-docblockr');
    this.alignTags = config.get('alignTags');
    this.newLinesBetweenTags = config.get('newLinesBetweenTags');
    this.columnCount = config.get('columnSpacing');
    this.style = config.get('commentStyle');
    this.defaultReturnTag = config.get('defaultReturnTag');
  }

  /**
   * Renders parameter tag template for docblock
   *
   * @param   {SnippetString}  snippet    The snippet to process
   * @param   {string}         typeSpace  Spaces between parameter's tag and
   *                                      type
   * @param   {string}         type       The parameter's type
   * @param   {string}         nameSpace  Spaces between parameter's type and
   *                                      name
   * @param   {string}         name       The parameter's name binding
   * @param   {string}         descSpace  Spaces between parameter's name and
   *                                      description
   * @param   {string}         desc       The parameter's description
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
        .appendPlaceholder(type)
        .appendText(' ')
        .appendText(name)
        .appendText(this.settings.eos)
        .appendText(this.settings.separator)
        .appendText('  ')
        .appendPlaceholder(desc);
    } else {
      snippet
        .appendText(this.settings.separator)
        .appendText(`@param${typeSpace}`)
        .appendPlaceholder(type)
        .appendText(nameSpace)
        .appendText(name)
        .appendText(descSpace)
        .appendPlaceholder(desc);
    }
  }

  /**
   * Renders return tag with return type and computed spacing
   *
   * @param   {SnippetString}  snippet      The snippet string add the tag to
   * @param   {string}         typeSpacing  The spacing before the return type
   * @param   {string}         type         The return tag type
   * @param   {string}         spacing      Spacing between type and description
   * @param   {string}         desc         The return description
   */
  public addReturnTag(snippet: SnippetString, typeSpacing: string, type: string, spacing: string, desc: string): void {
    if (this.style === 'drupal') {
      snippet
        .appendText(this.settings.separator)
        .appendText('@return ')
        .appendPlaceholder(type)
        .appendText(`${this.settings.eos}${this.settings.separator}  `)
        .appendPlaceholder(desc);
    } else {
      snippet
        .appendText(this.settings.separator)
        .appendText('@return')
        .appendText(typeSpacing)
        .appendPlaceholder(type)
        .appendText(spacing)
        .appendPlaceholder(desc);
    }
  }


  /**
   * Renders a variable tag
   *
   * @param   {SnippetString}  snippet  The snippet to apply the tag to
   * @param   {string}         type     The variable's type
   */
  public addVarTag(snippet: SnippetString, type: string): void {
    snippet
      .appendText(`${this.settings.separator}@var `)
      .appendPlaceholder(type);
  }

  /**
   * Generate x number of space characters, where x = `count`
   *
   * @param   {number}  count  The number of spaces to generate
   *
   * @return  {string}         The generated spaces
   */
  public generateSpacing(count: number): string {
    if (count < 1) {
      count = 1;
    }

    if (!this.alignTags) {
      count = 2;
    }

    return Array(count).join(' ');
  }

  /**
   * Retrieves a symbol defined for the provided code snippet
   *
   * @param   {string}   code  The code snippet to parse
   *
   * @return  {Symbols}        The parsed symbol
   */
  public getSymbols(code: string): Symbols {
    const symbols = new Symbols();

    for (const token of this.getTokens(code)) {
      if (this.done) {
        break;
      }

      this.parseClass(token, symbols);
      this.parseFunction(token, symbols);
      this.parseParameters(token, symbols);
      this.parseVariable(token, symbols);
    }

    this.reset();

    return symbols;
  }

  /**
   * Retrieve a list of Acorn tokens from a code snippet.
   *
   * @param   {string}  code  The code snippet to build tokens from.
   *
   * @return  {Token[]}       A list of Acorn tokens.
   *
   * @throws  {Error}         Throws an error if Acorn receives an invalid
   *                          character
   */
  public getTokens(code: string): Token[] {
    return [...tokenizer(code)];
  }

  /**
   * Parse language tokens from code string and send tokens to docblock render
   *
   * @param   {TextDocument}   editor  The content of the editor
   *
   * @return  {SnippetString}          The rendered docblock string
   */
  public init(editor: TextEditor): SnippetString {
    const { document } = editor;
    // Refers to user's current cursor position
    const { selection } = window.activeTextEditor;
    // Determine numerical position of line below user's current position
    // This is assumed to be the code we want to tokenize
    const nextLine = document.lineAt(selection.active.line + 1);
    // Prevent potential lexer issues by trimming trailing whitespace
    const nextLineTrimmed = nextLine.text.trim();
    try {
      // Attempt to get token information needed for render doc string
      const symbols = this.getSymbols(nextLineTrimmed);
      return this.renderBlock(symbols);
    } catch (error) {
      if (error instanceof Error) {
        window.showErrorMessage(error.message);
      }

      // If no valid token was created, create an empty doc block string
      return this.renderEmptyBlock();
    }
  }

  /**
   * Removes trailing whitespace from a snippet string
   *
   * @param   {SnippetString}  snippetString  The snippet string to format
   *
   * @return  {SnippetString}                 The formatted snippet string
   */
  public static removeTrailingWhiteSpace(snippetString: SnippetString): SnippetString {
    return new SnippetString(snippetString.value.replace(/\s$/gm, ''));
  }

  /**
   * Renders docblock string based on tokenized object
   *
   * @param   {Symbols}        tokens  Tokenized docblock object
   *
   * @return  {SnippetString}          Generated docblock string
   */
  public renderBlock(tokens: Symbols): SnippetString {
    if (!tokens.name || !tokens.type) {
      return this.renderEmptyBlock();
    }

    const { commentClose, commentOpen, eos, separator } = this.settings;

    const snippet = new SnippetString(commentOpen + eos);

    snippet
      .appendText(separator)
      .appendPlaceholder(`[${tokens.name} description]`);

    this.renderParamTags(tokens, snippet);
    this.renderReturnTag(tokens, snippet);
    this.renderVarTag(tokens, snippet);

    snippet.appendText(eos + commentClose);

    return Parser.removeTrailingWhiteSpace(snippet);
  }

  /**
   * Generates an empty doc block string when nothing was successfully parsed
   *
   * @return  {SnippetString}  Empty doc block string
   */
  public renderEmptyBlock(): SnippetString {
    const { commentClose, commentOpen, eos, separator } = this.settings;

    return new SnippetString()
      .appendText(commentOpen)
      .appendText(eos)
      .appendText(separator)
      .appendPlaceholder('[description]')
      .appendText(eos)
      .appendText(commentClose);
  }

  /**
   * Renders a docblock string from the provided selection
   *
   * @param   {Selection}     selection  The current selection in the editor
   *
   * @return  {SnippetString}            The rendered docblock in a snippet string
   */
  public renderFromSelection(selection: Selection): SnippetString {
    // Retrieve the code from the selection
    const { document } = window.activeTextEditor;
    const code = document.getText(selection);

    // Generate symbols from the code string
    const symbols = this.getSymbols(code);

    return this.renderBlock(symbols);
  }

  /**
   * Renders parameter tags for docblock
   *
   * @param   {Symbols}        tokens       Tokenized code
   * @param   {SnippetString}  snippet      List of docblock lines
   */
  public renderParamTags(tokens: Symbols, snippet: SnippetString): void {
    // Parameter tags shouldn't be needed if no parameter tokens are available,
    // or if the code is a class property or variable
    if (tokens.params.length && tokens.type !== SymbolKind.Variable) {
      if (this.newLinesBetweenTags) {
        // Apply empty line
        snippet.appendText(this.settings.eos + this.settings.separator);
      }

      // Determine if any parameters contain defined type information for
      // calculating type spacing
      const hasType = tokens.params.some((param) => Object.prototype.hasOwnProperty.call(param, 'type'));

      // Get maximum parameter type size
      const typeDiff = this.maxParams(tokens, 'type');

      // Iterator over list of parameters
      for (const param of tokens.params) {
        const noType = this.typePlaceholder;

        const diff = this.maxParams(tokens, 'name') - param.name.length;

        const descriptionSpacing = this.generateSpacing((this.columnCount + 1) + diff);

        // Use the type placeholder if no parameter type was provided
        const type = Object.prototype.hasOwnProperty.call(param, 'type') ? param.type : noType;

        // Ensure there is at least one space between type and parameter name
        // in docblock
        let nameDiff = 1;
        // Check if any params have a defined type, if no the type space
        // difference should default to 1
        if (hasType) {
          // Calculate difference between longest type and current type
          nameDiff = typeDiff - type.length + 1;
        }

        const nameSpacing = this.generateSpacing(this.columnCount + nameDiff);

        const typeSpacing = this.generateSpacing(this.columnCount + 2);

        const name = param.name;

        snippet.appendText(this.settings.eos);

        // Description shortcut
        const desc = `[${name} description]`;
        // Append param to docblock
        this.addParamTag(snippet, typeSpacing, type, nameSpacing, name, descriptionSpacing, desc);
      }
    }
  }

  /**
   * Render return tag for docblock
   *
   * @param   {Symbols}        symbols    Tokenized code
   * @param   {SnippetString}  snippet    List of docblock lines
   */
  public renderReturnTag(symbols: Symbols, snippet: SnippetString): void {
    // Determine whether or not to display the return type by default
    const defaultReturnTag = this.defaultReturnTag;
    // Check if return section should be displayed
    if (defaultReturnTag && symbols.type === SymbolKind.Function) {
      let type = this.typePlaceholder;
      // Check if a return type was provided
      if (symbols.return.type) {
        type = symbols.return.type;
      }

      const typeSpacing = this.generateSpacing(this.columnCount + 1);

      if (this.newLinesBetweenTags) {
        // Empty line
        snippet.appendText(this.settings.eos + this.settings.separator);
      }
      snippet.appendText(this.settings.eos);

      // Get maximum param size
      const diff = this.maxParams(symbols, 'name');
      const typeDiff = this.maxParams(symbols, 'type');

      const { columnCount } = this;

      // Calculate number of spaces between return type and description
      const spacingTotal = typeDiff - type.length + columnCount + diff + columnCount + 1;

      // Determine the spacing between return type and description
      const spacing = this.generateSpacing(spacingTotal);

      // Format return description to be tab-able
      const description = '[return description]';

      this.addReturnTag(snippet, typeSpacing, type, spacing, description);
    }
  }

  /**
   * Render var tag for docblock
   *
   * @param   {Symbols}        symbols    Tokenized code
   * @param   {SnippetString}  snippet    List of docblock lines
   */
  public renderVarTag(symbols: Symbols, snippet: SnippetString): void {
    // Add special case of variable blocks
    if (symbols.type === SymbolKind.Variable) {
      if (this.newLinesBetweenTags) {
        // Empty line
        snippet.appendText(this.settings.eos + this.settings.separator);
      }
      snippet.appendText(this.settings.eos);
      // Format type to be tab-able
      const type: string = symbols.varType ? symbols.varType : `[type]`;

      this.addVarTag(snippet, type);
    }
  }

  /**
   * Checks if the given string is a variable name and not a reserved keyword
   *
   * @param   {string}   name  The string to check
   *
   * @return  {boolean}        True if the string is a valid name
   */
  protected isName(name: string): boolean {
    const isModifier = this.grammar.is(name, 'modifiers');
    const isVariable = this.grammar.is(name, 'variables');
    const isType = this.grammar.is(name, 'types');

    return !isModifier && !isVariable && !isType && this.matchesIdentifier(name);
  }

  /**
   * Checks if the given string matches the languages identifer expression
   *
   * @param   {string}   item  The string to check
   *
   * @return  {boolean}        True if the item matches the expression,
   *                           otherwise false
   */
  protected matchesIdentifier(item: string): boolean {
    const expression = new RegExp(this.grammar.identifier);

    return item && expression.test(item);
  }

  /**
   * Finds the longest value property value of property provided
   *
   * Used for spacing out docblock segments per line
   *
   * @param   {Symbols}  tokens    Parsed tokens from code string
   * @param   {string}  property  The token property to calculate
   *
   * @return  {number}             The longest token value of property provided
   */
  protected maxParams(tokens: Symbols, property: string): number {
    if (!tokens.params.length) {
      return this.columnCount;
    }

    // Filter out any parameters without property provided
    const filtered = tokens.params.filter((param) => Object.prototype.hasOwnProperty.call(param, property));
    // Convert parameter object into simple list of given property name
    const params: number[] = filtered.map((param) => param[property].length);
    // If nothing parsed return zero
    if (!params.length && property === 'type') {
      return this.typePlaceholder.length;
    }
    // Add return type length if type is requested
    if (property === 'type' && tokens.return.type) {
      params.push(tokens.return.type.length);
    }
    // Get the longest parameter property in list
    return params.reduce((a, b) => Math.max(a, b));
  }

  /**
   * Parses class tokens from the code snippet provided to Acorn
   *
   * @param  {Token}    token    The token currently being parsed
   * @param  {Symbols}  symbols  The parsed symbols
   */
  protected abstract parseClass(token: Token, symbols: Symbols): void;

  /**
   * Parses function tokens from the code snippet provided to Acorn
   *
   * @param  {Token}    token    The token currently being parsed
   * @param  {Symbols}  symbols  The parsed symbols
   */
  protected abstract parseFunction(token: Token, symbols: Symbols): void;

  /**
   * Parses function parameter tokens from the code snippet provided to Acorn
   *
   * @param  {Token}    token    The token currently being parsed
   * @param  {Symbols}  symbols  The parsed symbols
   */
  protected abstract parseParameters(token: Token, symbols: Symbols): void;

  /**
   * Parses variable tokens from the code snippet provided to Acorn
   *
   * @param  {Token}    token    The token currently being parsed
   * @param  {Symbols}  symbols  The parsed symbols
   */
  protected abstract parseVariable(token: Token, symbols: Symbols): void;

  /**
   * Resets all parsing flags after symbols have been parsed
   */
  protected reset(): void {
    this.done = false;
    this.expectName = false;
    this.expectParameter = false;
    this.expectParameterType = false;
    this.expectReturnType = false;
  }
}
