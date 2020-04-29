interface IGrammar {
  /**
   * Represents class identifiers
   */
  class: string[];

  /**
   * Represents function identifiers
   */
  function: string[];

  /**
   * Regular expression that matches a valid name such as a variable name
   */
  identifier: string;

  /**
   * Represents modifier identifiers
   */
  modifiers: string[];

  /**
   * Represents type identifiers
   */
  types: string[];

  /**
   * Represents variable identifiers
   */
  variables: string[];
}

/**
 * Represents the grammar configuration for a language
 */
export class Grammar implements IGrammar {
  /**
   * @inheritdoc
   */
  public class: string[];

  /**
   * @inheritdoc
   */
  public function: string[];

  /**
   * @inheritdoc
   */
  public identifier: string;

  /**
   * @inheritdoc
   */
  public modifiers: string[];

  /**
   * @inheritdoc
   */
  public types: string[];

  /**
   * @inheritdoc
   */
  public variables: string[];

  constructor(grammar: IGrammar) {
    this.class      = grammar.class;
    this.function   = grammar.function;
    this.identifier = grammar.identifier;
    this.modifiers  = grammar.modifiers;
    this.types      = grammar.types;
    this.variables  = grammar.variables;
  }

  /**
   * Checks if the given string belongs to the specified grammar
   *
   * @param   {string}   token     The string to check
   * @param   {string}   property  The grammar property to check against
   *
   * @throws  {Error}              Will throw an error if `property` doesn't
   *                               match a valid grammar property
   *
   * @return  {boolean}            True if the string matches the grammar
   *                               otherwise false
   */
  public is(token: string, property: string): boolean {
    if (!this[property]) {
      throw new Error(`Property does not exist: ${property}`);
    }

    return token && this[property].includes(token);
  }
}
