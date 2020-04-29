import { SymbolKind } from 'vscode';

/**
 * Describes a function parameter
 */
export interface IParam {
  /**
   * Parameter's name. Should always be present
   */
  name: string;

  /**
   * Parameter's data type. This is usually language specific and is not
   * required. Ex. string, integer, array, etc.
   */
  type?: string;

  /**
   * Parameter's value. Usually empty string if no parameter value is provided
   */
  val?: string;
}

interface IReturnToken {
  /**
   * Indicates if there is a return value for this function
   */
  present: boolean;

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
   * Name of code binding/identifier
   */
  public name: string = '';

  /**
   * List of function parameters if token is describing a function
   */
  public params?: IParam[] = [];

  /**
   * Describes if there is a return value, and what type it is
   */
  public return: IReturnToken = {
    present: false,

    type: '',
  };

  /**
   * What type of code it is. (class, function, variable)
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
