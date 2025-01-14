import { DocumentSymbol, SymbolKind } from 'vscode';

/**
 * A utility class providing methods to determine the type of a given symbol.
 */
export class Utilities {
  /**
   * Determines if the given symbol details represent a function or method.
   *
   * @param symbol - The details of the symbol to check.
   *
   * @returns `true` if the symbol is a function or method, otherwise `false`.
   */
  public static isFunction(symbol: DocumentSymbol): boolean {
    return symbol.kind === SymbolKind.Function || symbol.kind === SymbolKind.Method;
  }

  /**
   * Determines if the symbol details is a variable, constant, or property.
   *
   * @param symbol - The details of the symbol to check.
   *
   * @returns `true` if the symbol is a variable, constant, or property,
   *          otherwise, `false`.
   */
  public static isVariable(symbol: DocumentSymbol): boolean {
    return symbol.kind === SymbolKind.Variable ||
      symbol.kind === SymbolKind.Constant ||
      symbol.kind === SymbolKind.Property;
  }
}
