/**
 * Java specific language parser
 */

'use strict';

import { Parser } from '../parser';

export class Java extends Parser {
  protected classGrammars = {
    name: [],
    type: [],
  };

  protected functionGrammars = {
    name: [],
    parameter: [],
    type: [],
  };

  protected variableGrammars = {
    name: [],
    type: [],
  };

  constructor() {
    super({});

    this.languageId = 'java';
  }
}
