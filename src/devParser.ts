import {
  commands,
  DocumentSymbol,
  Hover,
  MarkdownString,
  Position,
  Range,
  SemanticTokens,
  SemanticTokensLegend,
  TextDocument,
  TextDocumentChangeEvent,
  window,
  workspace,
} from 'vscode';

import { Utilities } from './utilities';

/**
 * Represents a decoded semantic token.
 */
interface DecodedToken {
  line: number;
  character: number;
  length: number;
  tokenType: string;
  tokenModifiers: string[];
}

/**
 * Represents the details of a parameter.
 */
interface ParameterDetails {
  token: DecodedToken;
  value: string;
  type?: string;
}

/**
 * Represents the details of a symbol in a document.
 */
export interface SymbolDetails {
  symbol: DocumentSymbol;
  parameters?: ParameterDetails[];
  returnType?: string;
  text: string;
  variableType?: string;
}

/**
 * The class for parsing and analyzing code in a text document.
 *
 * @remarks
 * This class utilizes the VS Code API to execute commands for retrieving
 * document symbols and semantic tokens. It also includes methods for decoding
 * semantic tokens and finding symbols within a specified range.
 *
 * @example
 * ```typescript
 * const parser = new Parser(document);
 * await parser.parse();
 * ```
 */
export class DevParser {
  /**
   * A regular expression to match parameter types.
   *
   * It captures the parameter type after the colon (:) and optional whitespace.
   */
  protected parameterTypeRegex = /\(parameter\)\s+\w+\s*:\s*([\w\s<>|&[\]{}().,:'"]+)/gm;

  /**
   * A regular expression to match the return type of a function.
   */
  protected returnTypeRegex = /\)\s*:\s*([^\s]+)/;

  /**
   * A regular expression to match variable types.
   */
  protected variableTypeRegex = /(?<=[:]\s)([\w<>[\],\s?&|()]+)/gm;

  /**
   * Creates an instance of the `Parser`.
   *
   * @param document - The text document to be processed.
   */
  public constructor(document: TextDocument) {
    this.document = document;

    // Register an event listener for document changes.
    workspace.onDidChangeTextDocument((event) => {
      this.onDocumentChange(event);
    });

    // Register an event listener for document close events.
    workspace.onDidCloseTextDocument((document) => {
      this.onDocumentClose(document);
    });
  }

  /**
   * The document associated with this parser.
   */
  private document: TextDocument;

  /**
   * A cache that stores semantic tokens mapped by their string identifiers.
   *
   * This helps in reducing redundant computations by reusing previously
   * computed semantic tokens.
   */
  private semanticTokensCache: Map<string, SemanticTokens> = new Map();

  /**
   * A cache that stores document symbols mapped by their string identifiers.
   *
   * This helps in reducing redundant computations by reusing previously
   * computed symbols.
   */
  private symbolCache: Map<string, DocumentSymbol[]> = new Map();

  /**
   * Parses and retrieves details for the symbol at the specified position.
   *
   * @param position - The position in the document to parse.
   *
   * @returns A promise that resolves to the symbol details.
   */
  public async parse(position: Position): Promise<SymbolDetails> {
    const symbols = await this.collectSymbols();
    console.log('Symbols:', symbols);

    const symbol = this.findSymbolInRange(symbols, position);
    console.log('findNextSymbol:', this.findNextSymbol(symbols, position));
    const detailedSymbols = await this.parseSymbolDetails(symbol);
    console.log('Detailed symbols:', detailedSymbols);

    return detailedSymbols;
  }

  /**
   * Manually refreshes the symbols by clearing the cache and re-fetching the symbols.
   */
  public async refreshSymbols(): Promise<DocumentSymbol[]> {
    this.clearSymbolCache(this.document.uri.toString());
    return this.collectSymbols();
  }

  protected cleanHoverTypeForParameter(hoverData: string): string {
    const result = this.parameterTypeRegex.exec(hoverData);

    if (result) {
      return result[1];
    }

    return null;
  }

  protected cleanHoverTypeForVariable(hoverData: string): string {
    const result = this.variableTypeRegex.exec(hoverData);

    if (result) {
      return result[1];
    }

    return null;
  }

  /**
   * Clears the symbol cache for a specific document or all documents.
   *
   * @param uri - Optional URI of the document to clear the cache for. If not
   *              provided, the entire cache will be cleared.
   */
  protected clearSymbolCache(uri?: string): void {
    if (uri) {
      this.symbolCache.delete(uri);
    } else {
      this.symbolCache.clear();
    }
  }

  /**
   * Collects semantic tokens for a given range in the document.
   *
   * This method checks if the semantic tokens for the given range are already
   * cached. If cached, it returns the cached tokens. Otherwise, it requests
   * the tokens from the VS Code API and caches the result before returning it.
   *
   * @param range - The range within the document to collect semantic tokens for.
   *
   * @returns A promise that resolves to the semantic tokens for the specified range.
   */
  protected async collectSemanticTokens(range: Range): Promise<SemanticTokens> {
    const rangeKey = `${range.start.line},${range.start.character},${range.end.line},${range.end.character}`;
    if (this.semanticTokensCache.has(rangeKey)) {
      return this.semanticTokensCache.get(rangeKey);
    }

    const tokens = await commands.executeCommand<SemanticTokens>(
      'vscode.provideDocumentRangeSemanticTokens',
      this.document.uri,
      range,
    );

    if (tokens) {
      this.semanticTokensCache.set(rangeKey, tokens);
      return tokens;
    }

    return null;
  }

  /**
   * Collects the semantic tokens legend for a given document and range.
   *
   * If the legend is already cached, it returns the cached legend. Otherwise,
   * it retrieves the legend by executing the
   * 'vscode.provideDocumentRangeSemanticTokensLegend' command.
   *
   * @param document - The text document for which to collect the semantic
   *                   tokens legend.
   * @param range - The range within the document for which to collect the
   *                semantic tokens legend.
   *
   * @returns A promise that resolves to the semantic tokens legend.
   */
  protected async collectSemanticTokensLegend(range: Range): Promise<SemanticTokensLegend> {
    const semanticTokenLegend = await commands.executeCommand<SemanticTokensLegend>(
      'vscode.provideDocumentRangeSemanticTokensLegend',
      this.document.uri,
      range,
    );

    if (semanticTokenLegend) {
      return semanticTokenLegend;
    }

    return null;
  }

  /**
   * Collects all symbols from the given document.
   *
   * This method uses the VS Code API to execute the document symbol provider
   * command and retrieve all symbols present in the specified document.
   *
   * @returns A promise that resolves to an array of DocumentSymbol objects.
   */
  protected async collectSymbols(): Promise<DocumentSymbol[]> {
    const uri = this.document.uri.toString();

    // Check if symbols are already cached
    if (this.symbolCache.has(uri)) {
      return this.symbolCache.get(uri) ?? [];
    }

    // Fetch symbols using VS Code API
    const symbols = await commands.executeCommand<DocumentSymbol[]>(
      'vscode.executeDocumentSymbolProvider',
      this.document.uri,
    );

    if (symbols === undefined || symbols === null) {
      window.showErrorMessage('Failed to retrieve document symbols. Ensure a language server is installed for the current language.');
      return [];
    }

    // Cache the symbols
    this.symbolCache.set(uri, symbols);

    return symbols;
  }

  /**
   * Computes the distance from a position to a range.
   *
   * @param position - The position to compare.
   * @param range - The range to compute the distance from.
   *
   * @returns The distance from the position to the range.
   */
  protected computeDistance(position: Position, range: Range): number {
    if (position.isBefore(range.start)) {
      return range.start.line - position.line;
    }
    if (position.isAfter(range.end)) {
      return position.line - range.end.line;
    }
    return 0; // Inside the range
  }

  /**
   * Creates a `Range` object from a given `DecodedToken`.
   *
   * @param token - The decoded token to create the range.
   *
   * @returns The token represented as a range.
   */
  protected createRangeFromToken(token: DecodedToken): Range {
    const lineText = this.document.lineAt(token.line).text;
    const endCharacter = Math.min(token.character + token.length, lineText.length);
    const start = new Position(token.line, token.character);
    const end = new Position(token.line, endCharacter);

    return new Range(start, end);
  }

  /**
   * Decodes a list of semantic tokens into a more readable format.
   *
   * @param tokens - The semantic tokens to decode.
   * @param legend - The semantic tokens legend to use for decoding.
   *
   * @returns An array of decoded tokens modifiers.
   */
  protected decodeTokens(tokens: SemanticTokens, legend: SemanticTokensLegend): DecodedToken[] {
    const decodedTokens: DecodedToken[] = new Array(tokens.data.length / 5);
    const { data } = tokens;

    let line = 0;
    let character = 0;

    for (let encodedIndex = 0, decodedIndex = 0; encodedIndex < data.length; encodedIndex += 5, decodedIndex++) {
      line += data[encodedIndex];
      character += data[encodedIndex + 1];
      const length = data[encodedIndex + 2];
      const tokenType = legend.tokenTypes[data[encodedIndex + 3]];
      const tokenModifiers = this.getTokenModifiersFromBitset(data[encodedIndex + 4], legend);

      decodedTokens[decodedIndex] = { line, character, length, tokenType, tokenModifiers };
    }

    return decodedTokens;
  }

  protected findNextSymbol(symbols: DocumentSymbol[], position: Position): DocumentSymbol | null {
    for (const symbol of symbols) {
      if (symbol.range.start.isAfter(position)) {
        return symbol;
      }

      const child = this.findNextSymbol(symbol.children || [], position);
      if (child) return child;
    }
    return null;
  }

  /**
   * Finds the closest `DocumentSymbol` within a given range.
   *
   * @param symbols - An array of `DocumentSymbol` objects to search within.
   * @param position - The `Position` to check for containment within the symbols' ranges.
   *
   * @returns The closest `DocumentSymbol` that contains the position, or the
   *          closest symbol if none contain the position.
   */
  protected findSymbolInRange(symbols: DocumentSymbol[], position: Position): DocumentSymbol | null {
    let closest: DocumentSymbol | null = null;

    for (const symbol of symbols) {
      console.log('Checking symbol:', symbol);

      // Check if the position is inside the symbol's range
      if (symbol.range.contains(position)) {
        console.log('Symbol contains position:', symbol.name);

        // Recurse into children to find the most specific match
        const childClosest = this.findSymbolInRange(symbol.children || [], position);
        console.log('Child closest:', childClosest);

        // Update closest to the more specific child or the current symbol
        closest = childClosest || symbol;
      } else if (!closest || this.isCloser(position, symbol, closest)) {
        // If no symbol contains the position, track the closest by distance
        closest = symbol;
      }

      console.log(`Closest so far: ${closest?.name}`);
    }

    return closest;
  }

  /**
   * Determines which of the two symbols is closer to the given position.
   *
   * @param position - The position to compare the distances from.
   * @param symbol1 - The first document symbol to compare.
   * @param symbol2 - The second document symbol to compare.
   *
   * @returns The symbol that is closer to the position, or null if both are null.
   */
  protected getClosest(
    position: Position,
    symbol1: DocumentSymbol | null,
    symbol2: DocumentSymbol | null
  ): DocumentSymbol | null {
    if (!symbol1) return symbol2;
    if (!symbol2) return symbol1;
    return this.isCloser(position, symbol1, symbol2) ? symbol1 : symbol2;
  }

  /**
   * Retrieves hover information at the specified position in the document.
   *
   * @param position - The position containing the hover information.
   *
   * @returns A promise that resolves to an array of Hover objects.
   */
  protected async getHovers(position: Position): Promise<Hover[]> {
    const hover = await commands.executeCommand<Hover[]>(
      'vscode.executeHoverProvider',
      this.document.uri,
      position,
    );

    return hover;
  }

  /**
   * Retrieves token modifiers based on a bitset and a semantic tokens legend.
   *
   * @param bitset - A number representing the bitset where each bit corresponds
   *                 to a token modifier.
   * @param legend - An object containing the semantic tokens legend, which
   *                 includes an array of token modifiers.
   * @returns An array of token modifiers that are set in the bitset.
   */
  protected getTokenModifiersFromBitset(bitset: number, legend: SemanticTokensLegend): string[] {
    const modifiers: string[] = [];

    for (let index = 0; index < legend.tokenModifiers.length; index++) {
      if (bitset & (1 << index)) {
        modifiers.push(legend.tokenModifiers[index]);
      }
    }

    return modifiers;
  }

  /**
   * Checks if the first symbol is closer to the position than the second symbol.
   *
   * @param position - The position to compare the distances from.
   * @param symbol1 - The first document symbol to compare.
   * @param symbol2 - The second document symbol to compare.
   *
   * @returns A boolean indicating whether the first symbol is closer to the
   *          position than the second symbol.
   */
  protected isCloser(position: Position, symbol1: DocumentSymbol, symbol2: DocumentSymbol) {
    const distance1 = this.computeDistance(position, symbol1.range);
    const distance2 = this.computeDistance(position, symbol2.range);

    return distance1 < distance2;
  }

  /**
   * Parses the type of a parameter within the given range.
   *
   * @param range - The range within which to parse the parameter type.
   *
   * @returns A promise that resolves to the parameter type as a string, or
   *          null if the type could not be determined.
   */
  protected async parseParameterType(range: Range): Promise<string | null> {
    let type: string = null;

    const hovers = await this.getHovers(range.start);

    for (const hover of hovers) {
      for (const content of hover.contents) {
        const tempType = this.cleanHoverTypeForParameter((content as MarkdownString).value);

        if (typeof tempType === 'string') {
          type = tempType.trim();
          break;
        }
      }

      if (type) {
        break;
      }
    }

    return type;
  }

  /**
   * Parses the parameters of a given function symbol and returns their details.
   *
   * @param symbol - The `DocumentSymbol` whose parameters are to be parsed.
   *
   * @returns A promise that resolves to an array of `ParameterDetails`, each
   *          containing information about a parameter.
   *
   * @throws Will show an error message if no opening parenthesis is found in
   *         the function call.
   * @throws Will show an error message if no parameter range is found in the
   *         function call.
   */
  protected async parseParameters(symbol: DocumentSymbol): Promise<ParameterDetails[]> {
    console.log(this.document.getText(symbol.range));

    const semanticTokensLegend = await this.collectSemanticTokensLegend(symbol.range);
    const semanticTokens = await this.collectSemanticTokens(symbol.range);

    if (semanticTokens && semanticTokensLegend) {
      const decodedTokens: ParameterDetails[] = [];

      for (const token of this.decodeTokens(semanticTokens, semanticTokensLegend)) {
        const range = this.createRangeFromToken(token);
        const value = this.document.getText(range);

        if (value && token.tokenType === 'parameter' && token.tokenModifiers.includes('declaration')) {
          console.log('Token:', token);
          console.log('Value:', value);
          const type: string = await this.parseParameterType(range);

          decodedTokens.push({
            token,
            value,
            type,
          });
        }
      }

      return decodedTokens;
    }

    return null;
  }

  /**
   * Parses the details of a given document symbol.
   *
   * This method extracts the details of the symbol, such as the parameters of
   * a function, the return type of a function, or the type of a variable.
   *
   * @param symbol - The document symbol to parse.
   *
   * @returns A promise that resolves to the details of the symbol.
   */
  protected async parseSymbolDetails(symbol: DocumentSymbol): Promise<SymbolDetails> {
    const symbolText = this.document.getText(symbol.range);

    if (Utilities.isFunction(symbol)) {
      const parameters = await this.parseParameters(symbol);

      const returnTypeMatch = symbolText.match(this.returnTypeRegex);
      let returnType = null;

      if (returnTypeMatch) {
        returnType = returnTypeMatch[1];
      }

      return { symbol, parameters, returnType, text: symbolText };
    } else if (Utilities.isVariable(symbol)) {
      const variableType = await this.parserVariableType(symbol.range);

      return { symbol, text: symbolText, variableType };
    }

    return { symbol, text: symbolText };
  }

  protected async parserVariableType(range: Range): Promise<string> {
    let type: string = null;

    const hovers = await this.getHovers(range.start);

    for (const hover of hovers) {
      for (const content of hover.contents) {
        const tempType = this.cleanHoverTypeForVariable((content as MarkdownString).value);

        if (typeof tempType === 'string') {
          type = tempType.trim();
          break;
        }
      }

      if (type) {
        break;
      }
    }

    return type;
  }

  /**
   * Handles document change events to clear the cache for the changed document.
   */
  private onDocumentChange(event: TextDocumentChangeEvent): void {
    this.clearSymbolCache(event.document.uri.toString());
  }

  /**
   * Handles document close events to clear the cache for the closed document.
   */
  private onDocumentClose(document: TextDocument): void {
    this.clearSymbolCache(document.uri.toString());
  }
}
