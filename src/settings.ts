import { Grammar } from './grammar';

/**
 * Options object
 *
 * Can have any property name
 */
export interface IOptions {
  [key: string]: any;
}

/**
 * Object of language specific settings
 */
export class Settings {
  /**
   * End of a doc block
   */
  public commentClose: string = ' */';

  /**
   * Start of a doc block
   */
  public commentOpen: string = '/**';

  /**
   * End of doc block string
   */
  public eos: string = '\n';

  /**
   * Grammar definitions for language
   */
  public grammar: Grammar;

  /**
   * The beginning set of characters for a doc block
   */
  public separator: string = ' * ';

  /**
   * Dynamically updates class properties based on options object
   *
   * @param  {Options}  options  Options specific to language
   */
  constructor(options: IOptions = {}) {
    // Loop over options
    for (const option in options) {
      if (option === 'grammar') {
        this.grammar = new Grammar(options[option]);
      } else if (this.hasOwnProperty(option)) {
        // Apply option to settings
        this[option] = options[option];
      }
    }
  }
}
