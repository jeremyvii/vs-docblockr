import { Token, tokenizer } from 'acorn';
import { SymbolKind, TextEditor, window, workspace, WorkspaceConfiguration } from 'vscode';

import { Grammar } from './grammar';
import { IOptions, Settings } from './settings';
import { Symbols } from './symbols';

/**
 * Initial Class for parsing Doc Block comments
 */
export abstract class Parser {
  /**
   * The desired number of docblock columns defined by
   * `vs-docblockr.columnSpacing`
   *
   * @var {number}
   */
  public columnCount: number;

  /**
   * Number of spaces between tag elements. Retrieved from editor configuration
   *
   * @var {string}
   */
  public columns: string;

  /**
   * Extensions configuration settings
   *
   * @var {WorkspaceConfiguration}
   */
  public config: WorkspaceConfiguration;

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
  public typePlaceholder: string = '[type]';

  constructor(options: IOptions) {
    // Get instance of language settings
    this.settings = new Settings(options);

    this.grammar = this.settings.grammar;
    // Get extension configuration
    this.config = workspace.getConfiguration('vs-docblockr');
    // Get the configured column spacing from configuration object
    this.columnCount = this.config.get('columnSpacing');
    // Generate spaces based on the configured column value
    this.columns = this.generateSpacing(this.columnCount + 1);
    // Get the desired comment style
    this.style = this.config.get('commentStyle');
    // Determine whether the return tag should always be returned
    this.defaultReturnTag = this.config.get('defaultReturnTag');
  }

  /**
   * Generate x number of space characters, where x = `count`
   *
   * @param   {number}  count  The number of spaces to generate
   *
   * @return  {string}         The generated spaces
   */
  public generateSpacing(count: number): string {
    return Array(count).join(' ');
  }

  /**
   * Renders parameter tag template for docblock
   *
   * @param   {string}  typeSpace  Spaces between parameter's tag and type
   * @param   {string}  type       The parameter's type
   * @param   {string}  nameSpace  Spaces between parameter's type and name
   * @param   {string}  name       The parameter's name binding
   * @param   {string}  descSpace  Spaces between parameter's name and
   *                               description
   * @param   {string}  desc       The parameter's description
   *
   * @return  {string}             Rendered parameter tag
   */
  public getParamTag(
    typeSpace: string,
    type: string,
    nameSpace: string,
    name: string,
    descSpace: string,
    desc: string,
  ): string {
    let tag = `@param${typeSpace} ${type}${nameSpace}${name}${descSpace}${desc}`;

    if (this.style === 'drupal') {
      tag = `@param ${type} ${name}\n${this.settings.separator}  ${desc}`;
    }

    return tag;
  }

  /**
   * Renders return tag with return type and computed spacing
   *
   * @param   {string}  type     Type associated with return value (in docblock
   *                             not this method)
   * @param   {string}  spacing  Spacing between type and description
   * @param   {string}  desc     Return description
   *
   * @return  {string}           Rendered return tag
   */
  public getReturnTag(type: string, spacing: string, desc: string): string {
    let tag = `@return${this.columns}${type}${spacing}${desc}`;

    if (this.style === 'drupal') {
      tag = `@return ${type}\n${this.settings.separator}  ${desc}`;
    }

    return tag;
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
   */
  public getTokens(code: string): Token[] {
    return [...tokenizer(code)];
  }

  /**
   * Renders a variable tag
   *
   * @param   {string}  type  The variable's type
   *
   * @return  {string}        Rendered variable tag
   */
  public getVarTag(type: string): string {
    return `@var ${type}`;
  }

  /**
   * Parse language tokens from code string and send tokens to docblock render
   *
   * @param   {TextDocument}  editor  The content of the editor
   *
   * @return  {string}                The rendered docblock string
   */
  public init(editor: TextEditor): string {
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
    } catch {
      // If no valid token was created, create an empty doc block string
      return this.renderEmptyBlock();
    }
  }

  /**
   * Renders docblock string based on tokenized object
   *
   * @param   {Symbols}  tokens  Tokenized docblock object
   *
   * @return  {string}           Generated docblock string
   */
  public renderBlock(tokens: Symbols): string {
    if (!tokens.name || !tokens.type) {
      return this.renderEmptyBlock();
    }

    // Separate snippets by incrementing a counter
    let count = 1;

    // Convert string into tab-able snippet
    const placeholder = (str: string) => `\$\{${count++}:${str}\}`;

    let blockList: string[] = [];

    // Add the name to the block
    blockList.push(placeholder(`[${this.escape(tokens.name)} description]`));

    // Add the parameter tags to the block
    blockList = this.renderParamTags(tokens, blockList, placeholder);
    // Add the return tag to the block
    blockList = this.renderReturnTag(tokens, blockList, placeholder);
    // Add the variable tag to the block
    blockList = this.renderVarTag(tokens, blockList, placeholder);

    const { commentClose, commentOpen, eos, separator } = this.settings;

    const block = commentOpen + eos + blockList.map((blockLine) => {
      return separator + blockLine;
    }).join(eos) + eos + commentClose;

    return block.replace(/\s$/gm, '');
  }

  /**
   * Generates an empty doc block string when nothing was successfully parsed
   *
   * @return  {string}  Empty doc block string
   */
  public renderEmptyBlock(): string {
    const { commentClose, commentOpen, eos, separator } = this.settings;

    return (commentOpen + eos + separator + eos + commentClose).replace(/\s$/gm, '');
  }

  /**
   * Renders parameter tags for docblock
   *
   * @param   {Symbols}    tokens       Tokenized code
   * @param   {string[]}  blockList    List of docblock lines
   * @param   {Function}  placeholder  Function for snippet formatting
   *
   * @return  {string[]}               Parameter blocks appended to block
   *                                   list. Returns list pasted in if no
   *                                   parameters
   */
  public renderParamTags(
    tokens: Symbols,
    blockList: string[],
    placeholder: (str: string) => string,
  ): string[] {
    // Parameter tags shouldn't be needed if no parameter tokens are available,
    // or if the code is a class property or variable
    if (tokens.params.length && tokens.type !== SymbolKind.Variable) {
      // Empty line
      blockList.push('');

      // Determine if any parameters contain defined type information for
      // calculating type spacing
      const hasType = tokens.params.some((param) => param.hasOwnProperty('type'));

      // Get maximum parameter type size
      const typeDiff = this.maxParams(tokens, 'type');

      // Iterator over list of parameters
      for (const param of tokens.params) {
        const noType = this.typePlaceholder;

        const diff = this.maxParams(tokens, 'name') - param.name.length;

        const descSpace = this.generateSpacing((this.columnCount + 1) + diff);

        // Use the type placeholder if no parameter type was provided
        let type = param.hasOwnProperty('type') ? this.escape(param.type) : noType;

        // Ensure there is at least one space between type and parameter name
        // in docblock
        let nameDiff = 1;
        // Check if any params have a defined type, if no the type space
        // difference should default to 1
        if (hasType) {
          // Calculate difference between longest type and current type
          nameDiff = typeDiff - type.length + 1;
        }

        const nameSpace = this.generateSpacing(this.columnCount + nameDiff);

        const typeSpace = this.columns;

        // Wrap in placeholder to snippet tab-ability
        type = placeholder(noType);

        // Prevent tabstop conflicts
        const name = this.escape(param.name);
        // Description shortcut
        const desc = placeholder(`[${name} description]`);
        // Append param to docblock
        blockList.push(this.getParamTag(
          typeSpace,
          type,
          nameSpace,
          name,
          descSpace,
          desc,
        ));
      }
    }
    return blockList;
  }

  /**
   * Render return tag for docblock
   *
   * @param   {Symbols}    symbols       Tokenized code
   * @param   {string[]}  blockList    List of docblock lines
   * @param   {Function}  placeholder  Function for snippet formatting
   *
   * @return  {string[]}               Return block appended to block list.
   *                                   Returns list provided if variable or no
   *                                   return tag
   */
  public renderReturnTag(
    symbols: Symbols,
    blockList: string[],
    placeholder: (str: string) => string,
  ): string[] {
    // Determine whether or not to display the return type by default
    const defaultReturnTag = this.defaultReturnTag;
    // Check if return section should be displayed
    if (defaultReturnTag && symbols.type === SymbolKind.Function) {
      let type = this.typePlaceholder;
      // Check if a return type was provided
      if (symbols.return.type) {
        type = this.escape(symbols.return.type);
      }

      // Empty line
      blockList.push('');
      // Get maximum param size
      const diff = this.maxParams(symbols, 'name');
      const typeDiff = this.maxParams(symbols, 'type');
      // Calculate number of spaces between return type and description
      let spacingTotal = typeDiff - type.length + this.columnCount + diff + this.columnCount + 1;

      // Set spacing to column spacing in settings if value is less than
      // default column spacing plus one. This can happen when there are no
      // parameters
      if (spacingTotal < this.columnCount) {
        spacingTotal = this.columnCount + 1;
      }
      // Determine the spacing between return type and description
      const spacing = this.generateSpacing(spacingTotal);

      // Format type to be tab-able
      type = placeholder(type);

      // Format return description to be tab-able
      const description = placeholder('[return description]');

      blockList.push(this.getReturnTag(type, spacing, description));
    }
    return blockList;
  }

  /**
   * Render var tag for docblock
   *
   * @param   {Symbols}   symbols      Tokenized code
   * @param   {string[]}  blockList    List of docblock lines
   * @param   {Function}  placeholder  Function for snippet formatting
   *
   * @return  {string[]}               Var block appended to block list.
   *                                   Returns list provided if not a variable
   */
  public renderVarTag(
    symbols: Symbols,
    blockList: string[],
    placeholder: (str: string) => string,
  ): string[] {
    // Add special case of variable blocks
    if (symbols.type === SymbolKind.Variable) {
      // Empty line
      blockList.push('');
      // Format type to be tab-able
      const type: string = placeholder(symbols.varType ? symbols.varType : `[type]`);
      // Var type
      blockList.push(this.getVarTag(type));
    }
    return blockList;
  }

  /**
   * Replaces any `$` character with `\\$`
   *
   * Prevents issues with tabstop variables in Visual Studio Code
   *
   * @param   {string}  name  String to be escaped
   *
   * @return  {string}        Properly escaped string
   */
  protected escape(name: string): string {
    return name.replace('$', '\\$');
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
   * @param   {propety}  property  The token property to calculate
   *
   * @return  {number}             The longest token value of property provided
   */
  protected maxParams(tokens: Symbols, property: string): number {
    // If no parameters return zero
    if (!tokens.params.length) {
      return 0;
    }
    // Filter out any parameters without property provided
    const filtered = tokens.params.filter((param) => param.hasOwnProperty(property));
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
  protected reset() {
    this.done = false;
    this.expectName = false;
    this.expectParameter = false;
    this.expectParameterType = false;
    this.expectReturnType = false;
  }
}
