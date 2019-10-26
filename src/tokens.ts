/**
 * Describes a function parameter
 */
export interface Param {
  /**
   * Parameter's name. Should always be present
   */
  name: string;

  /**
   * Parameter's value. Usually empty string if no parameter value is provided
   */
  val: string;

  /**
   * Parameter's data type. This is usually language specific and is not
   * required. Ex. string, integer, array, etc.
   */
  type?: string;
}

interface ReturnToken {
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
 * Tokenized code returned from the parser. This defines whether lexed code was
 * a class, function of variable
 */
export class Tokens {
  /**
   * Name of code binding/identifier
   */
  public name: string = '';

  /**
   * What type of code it is. (class, function, variable)
   */
  public type: string = '';

  /**
   * When `Tokens.type` is variable, this optional value refers to that
   * variables type
   */
  public varType?: string = '';

  /**
   * Describes if there is a return value, and what type it is
   */
  public return: ReturnToken = {
    present: true,

    type: '',
  };

  /**
   * List of function parameters if token is describing a function
   */
  public params?: Param[] = [];
}
