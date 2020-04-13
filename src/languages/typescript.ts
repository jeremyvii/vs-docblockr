/**
 * TypeScript specific language parser
 */

'use strict';

import { Parser } from '../parser';
import { Tokens } from '../tokens';

import { IThemedTokenExplanation } from 'shiki/dist/themedTokenizer';

export class TypeScript extends Parser {
  protected classGrammars = {
    name: [
      'entity.name.type.class.ts',
      'entity.name.type.module.ts',
    ],
    type: [
      'storage.type.class.ts',
      'storage.type.interface.ts',
      'storage.type.namespace.ts',
    ],
  };

  protected functionGrammars = {
    name: [
      'entity.name.function.ts',
    ],
    parameter: [
      'variable.parameter.ts',
    ],
    parameterType: [
      'meta.type.annotation.ts',
    ],
    type: [
      'storage.type.function.ts',
    ],
  };

  protected variableGrammars = {
    name: [
      'meta.var-single-variable.expr.ts',
    ],
    type: [
      'meta.var.expr.ts',
    ],
  };

  constructor() {
    super({});

    this.languageId = 'typescript';
  }

  /**
   * Renders parameter tag template for docblock. This method is
   * being overwritten in order to wrap `{}` around binding types
   *
   * Arguments c, t, p should be assumed to be computed by `renderParamTags()`.
   * These ambiguous argument names simply refer to the spaces between columns.
   *
   * @param   {string}  c     Spaces computed between initial tag and param type
   * @param   {string}  type  The variable type of said parameter
   * @param   {string}  t     Spaces computed between param type and param name
   * @param   {string}  name  Parameter's name binding
   * @param   {string}  p     Spaces computed between param name and description
   * @param   {string}  desc  Describes the parameter
   *
   * @return  {string}        Rendered parameter tag
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
   * This method is modified to add the brackets `{}` required by jsDoc
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
   * This method is modified to add the brackets `{}` required by jsDoc
   *
   * @inheritdoc
   */
  public getVarTag(columns: string, type: string): string {
    return `@var${columns}{${type}}`;
  }

  public parseParameterTokens(explanation: IThemedTokenExplanation[], tokens: Tokens) {
    for (const explanationItem of explanation) {
      const scopes = explanationItem.scopes;

      const parameter = scopes.find((scope) => {
        return this.functionGrammars.parameter.includes(scope.scopeName);
      });

      if (parameter) {
        tokens.params.push({
          name: explanationItem.content,
          val: '',
        });
      }
    }
  }
}
