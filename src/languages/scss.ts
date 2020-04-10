/**
 * Scss specific language parser
 */

'use strict';

import { workspace } from 'vscode';
import { Parser } from '../parser';
import { IParam, Tokens } from '../tokens';

export class Scss extends Parser {
  /**
   * Constructs settings specific to Scss
   */
  constructor() {
    const config = workspace.getConfiguration('vs-docblockr');
    super({
      commentClose: config.get('scssCommentClose'),
      commentOpen: config.get('scssCommentOpen'),
      grammar: {
        class: 'class',
        function: '@function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: [],
        types: [],
        variables: [],
      },
      separator: config.get('scssCommentSeparator'),
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
