interface IGrammar {
  function: string[];
  class: string[];
  identifier: string;
  modifiers: string[];
  variables: string[];
  types: string[];
}

export class Grammar implements IGrammar {
  public function: string[];
  public class: string[];
  public identifier: string;
  public modifiers: string[];
  public variables: string[];
  public types: string[];

  constructor(grammar: IGrammar) {
    this.function   = grammar.function;
    this.class      = grammar.class;
    this.identifier = grammar.identifier;
    this.modifiers  = grammar.modifiers;
    this.variables  = grammar.variables;
    this.types      = grammar.types;
  }

  public is(token: string, property: string): boolean {
    if (!this[property]) {
      throw new Error(`Property does not exist: ${property}`);
    }

    return this[property].includes(token);
  }
}
