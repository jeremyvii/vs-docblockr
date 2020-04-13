/**
 * Scss specific language parser
 */

'use strict';

import { workspace } from 'vscode';
import { Parser } from '../parser';

export class Scss extends Parser {
  protected classGrammars = {
    name: [],
    type: [],
  };

  protected functionGrammars = {
    name: [
      'meta.at-rule.function.scss',
    ],
    parameter: [
      'variable.scss',
    ],
    type: [
      'keyword.control.at-rule.function.scss',
    ],
  };

  protected variableGrammars = {
    name: [],
    type: [],
  };

  constructor() {
    super({
      commentClose: workspace.getConfiguration('vs-docblockr').get('scssCommentClose'),
      commentOpen: workspace.getConfiguration('vs-docblockr').get('scssCommentOpen'),
      separator: workspace.getConfiguration('vs-docblockr').get('scssCommentSeparator'),
    });

    this.languageId = 'scss';
  }

  /**
   * This method is modified to add the brackets `{}` required by SassDoc
   *
   * @inheritdoc
   */
  public getParamTag(
    c: string,
    type: string,
    t: string,
    name: string,
    p: string,
    desc: string,
  ): string {
    let tag = `@param${c} {${type}}${t}${name}${p}${desc}`;
    if (this.style === 'drupal') {
      tag = `@param${c}{${type}}${c}${name}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  /**
   * This method is modified to add the brackets `{}` required by SassDoc
   *
   * @inheritdoc
   */
  public getReturnTag(type: string, spacing: string, desc: string): string {
    let tag = `@return${this.columns}{${type}}${spacing}${desc}`;
    if (this.style === 'drupal') {
      tag = `@return${this.columns}{${type}}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  /**
   * This method is modified to add the brackets `{}` required by SassDoc
   *
   * @inheritdoc
   */
  public getVarTag(columns: string, type: string): string {
    return `@var${columns}{${type}}`;
  }
}
