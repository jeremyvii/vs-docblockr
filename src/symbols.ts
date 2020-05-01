import { SymbolKind } from 'vscode';

/**
 * Describes a function parameter
 */
export interface IParam {
  /**
   * The parameter's name
   */
  name: string;

  /**
   * The parameter's type
   */
  type?: string;

  /**
   * The parameter's value
   */
  val?: string;
}

interface IReturnToken {
  /**
   * Describes what type of return value. (Optional)
   */
  type?: string;
}

/**
 * Represents a segment of code
 */
export class Symbols {
  /**
   * Name of code symbol
   */
  public name: string = '';

  /**
   * List of function parameters if the symbol is describing a function
   */
  public params?: IParam[] = [];

  /**
   * Describes a return type
   */
  public return: IReturnToken = {
    type: '',
  };

  /**
   * The symbols type (class, function, variable)
   */
  public type: SymbolKind;

  /**
   * When `Symbols.type` is variable, this optional value refers to that
   * variables type
   */
  public varType?: string = '';

  /**
   * Add a parameter the symbol
   *
   * @param  {IParam}  param  The parameter to add
   */
  public addParameter(param: IParam) {
    this.params.push(param);
  }

  /**
   * Retrieves the index of the last parameter in the parameter list
   *
   * @return  {number}  The index of the last parameter
   */
  public getLastParameterIndex(): number {
    return this.params.length - 1;
  }

  /**
   * Retrieve a parameter by it's index in the list
   *
   * @param   {number}  index  The index of the parameter to retrieve
   *
   * @return  {IParam}         The desired parameter, null if no parameter was
   *                           found
   */
  public getParameter(index: number): IParam {
    if (index < 0) {
      return null;
    }

    return this.params[index];
  }
}
