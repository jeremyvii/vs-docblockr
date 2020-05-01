import { Grammar, IGrammar } from './grammar';

export interface IOptions {
  /**
   * End of a doc block
   */
  commentClose?: string;

  /**
   * End of doc block string
   */
  commentOpen?: string;

  /**
   * End of doc block string
   */
  eos?: string;

  /**
   * Grammar definitions for language
   */
  grammar?: IGrammar;

  /**
   * The beginning set of characters for a doc block
   */
  separator?: string;
}

/**
 * Object of language specific settings
 */
export class Settings implements IOptions {
  /**
   * @inheritdoc
   */
  public commentClose: string = ' */';

  /**
   * @inheritdoc
   */
  public commentOpen: string = '/**';

  /**
   * @inheritdoc
   */
  public eos: string = '\n';

  /**
   * @inheritdoc
   */
  public grammar: Grammar;

  /**
   * @inheritdoc
   */
  public separator: string = ' * ';

  /**
   * @inheritdoc
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
