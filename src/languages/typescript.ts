import { Token } from 'acorn';
import { SnippetString, SymbolKind } from 'vscode';

import { Parser } from '../parser';
import { Symbols } from '../symbols';

/**
 * Parses tokens for the TypeScript and JavaScript language
 */
export class TypeScript extends Parser {
  /**
   * Informs the parser that the next token should be a generic parameter type
   *
   * @example
   * function foo(bar: Array<number>) {
   * }
   *
   * @var {boolean}
   */
  public expectGenericParameterType = false;

  /**
   * Informs the parser that the next token should be a generic return type
   *
   * @example
   * function foo(): Array<number> {
   * }
   *
   * @var {boolean}
   */
  public expectGenericReturnType = false;

  /**
   * Constructs settings specific to TypeScript
   */
  constructor() {
    super({
      grammar: {
        class: [
          'class',
          'interface',
        ],
        function: [
          'function',
        ],
        identifier: '([a-zA-Z_$0-9]+)',
        modifiers: [
          'get',
          'set',
          'static',
          'public',
          'private',
          'protected',
        ],
        types: [
          'any',
          'boolean',
          'never',
          'null',
          'number',
          'string',
          'void',
          'undefined',
        ],
        variables: [
          'const',
          'let',
          'var',
        ],
      },
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
   * @inheritdoc
   */
  public addReturnTag(snippet: SnippetString, typeSpacing: string, type: string, spacing: string, desc: string): void {
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
        .appendText(typeSpacing)
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
  public addVarTag(snippet: SnippetString, type: string): void {
    snippet
      .appendText(`${this.settings.separator}@var `)
      .appendText('{')
      .appendPlaceholder(type)
      .appendText('}');
  }

  /**
   * @inheritdoc
   */
  protected parseClass(token: Token, symbols: Symbols): void {
    // Check if the token represents a class identifier
    if (this.grammar.is(token.value, 'class')) {
      symbols.type = SymbolKind.Class;

      this.expectName = true;

      return;
    }

    // Check if the current token represents a valid class name
    if (this.expectName && symbols.type === SymbolKind.Class && this.isName(token.value)) {
      symbols.name = token.value;

      this.expectName = false;
      this.done = true;
    }
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

    // If an opening parenthesis occurs, assume that this token represents a
    // function
    if (token.type.label === '(') {
      symbols.type = SymbolKind.Function;
      this.expectParameter = true;
    }

    if (symbols.type === SymbolKind.Function) {
      this.parseReturnType(token, symbols);

      // Check for a valid function name
      if (this.expectName && this.isName(token.value) && !symbols.name) {
        symbols.name = token.value;

        this.expectName = false;

        return;
      }
    }
  }

  /**
   * Parses generic parameter type tokens
   *
   * @param  {Token}    token    The token retrieved from acorn
   * @param  {Symbols}  symbols  The symbols parsed from the tokens
   */
  protected parseGenericParameterType(token: Token, symbols: Symbols): void {
    // Check if the next expected token should be a generic parameter type
    if (this.expectGenericParameterType && token.value) {
      // Retrieve the last parameter
      const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

      if (lastParam) {
        // Add the remainder of the generic parameter type
        lastParam.type += `<${token.value}>`;
      }

      this.expectGenericParameterType = false;

      return;
    }

    // Check if a generic parameter type should be expected
    if (token.type.label === '</>/<=/>=') {
      this.expectGenericParameterType = true;

      return;
    }
  }

  /**
   * Parses parameter name tokens
   *
   * @param  {Token}    token    The token retrieved from acorn
   * @param  {Symbols}  symbols  The symbols parsed from the tokens
   */
  protected parseParameterName(token: Token, symbols: Symbols): void {
    // Ensure the next name is not suppose to be for a parameter type
    const notType = !(this.expectParameterType || this.expectGenericParameterType);

    // Check for a valid parameter name
    if (this.expectParameter && this.isName(token.value) && notType) {
      symbols.addParameter({
        name: token.value,
      });

      return;
    }
  }

  /**
   * Parses parameter type tokens
   *
   * @param  {Token}    token    The token retrieved from acorn
   * @param  {Symbols}  symbols  The symbols parsed from the tokens
   */
  protected parseParameterType(token: Token, symbols: Symbols): void {
    // Check if a parameter type should be expected
    if (token.type.label === ':' && !this.expectReturnType) {
      this.expectParameterType = true;

      return;
    }

    if (this.expectParameterType && token.value) {
      this.expectParameterType = false;

      // Retrieve the last parameter
      const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

      if (lastParam) {
        // Add the type to the last parameter
        lastParam.type = token.value;
      }

      return;
    }

    // Check if the parameter type is an array type
    if (token.type.label === '[') {
      // Retrieve the last parameter
      const lastParam = symbols.getParameter(symbols.getLastParameterIndex());

      if (lastParam) {
        // Mark the parameter type as an array
        lastParam.type += '[]';
      }

      return;
    }
  }

  /**
   * @inheritdoc
   */
  protected parseParameters(token: Token, symbols: Symbols): void {
    if (symbols.type === SymbolKind.Function) {
      this.parseGenericParameterType(token, symbols);
      this.parseParameterName(token, symbols);
      this.parseParameterType(token, symbols);

      if (token.type.label === ')') {
        this.expectParameter = false;

        return;
      }
    }
  }


  /**
   * Parses return type from Acorn token
   *
   * @param  {Token}    token    The token to parse
   * @param  {Symbols}  symbols  The parsed symbols
   */
  protected parseReturnType(token: Token, symbols: Symbols): void {
    // Check if a generic return type should be expected
    if (token.type.label === '</>/<=/>=') {
      this.expectGenericReturnType = true;

      return;
    }

    // Add the remainder of the generic return type
    if (this.expectGenericParameterType && token.value) {
      symbols.return.type += `<${token.value}>`;

      this.expectGenericReturnType = false;

      return;
    }

    // Check if the return type is an array
    if (token.type.label === '[') {
      symbols.return.type += '[]';

      return;
    }

    // Check if a return type should be expected
    if (token.type.label === ':' && !this.expectParameter) {
      this.expectReturnType = true;

      return;
    }

    // Add the token as a return type if it is valid
    if (this.expectReturnType && this.matchesIdentifier(token.value)) {
      this.expectReturnType = false;

      symbols.return.type = token.value;

      return;
    }
  }

  /**
   * @inheritdoc
   */
  protected parseVariable(token: Token, symbols: Symbols): void {
    // Check if the token is a variable or modifier
    const isVariable = this.grammar.is(token.value, 'variables');
    const isModifier = this.grammar.is(token.value, 'modifiers');

    if (!symbols.type && (isVariable || isModifier)) {
      symbols.type = SymbolKind.Variable;

      this.expectName = true;

      return;
    }

    // Expect the next token to be the name of an object literal
    if (token.type.label === '.') {
      symbols.type = SymbolKind.Variable;

      this.expectName = true;

      return;
    }

    // Check if the token is valid variable name
    const isVariableName = this.expectName && symbols.type === SymbolKind.Variable && this.isName(token.value);
    // Check if the token is possibly a function name. This is typically used
    // for JavaScript methods without modifiers.
    const isPossibleFunctionName = !symbols.type &&  this.isName(token.value);

    if (isVariableName || isPossibleFunctionName) {
      symbols.name = token.value;

      this.expectName = false;
    }
  }
}
