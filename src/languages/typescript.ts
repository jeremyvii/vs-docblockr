/**
 * TypeScript specific language parser
 */

'use strict';

import { Parser } from '../parser';
import { Tokens } from '../tokens';

import { IThemedToken } from 'shiki';

export class TypeScript extends Parser {
  protected functionGrammars = {
    name: 'entity.name.function.ts',
    parameter: 'variable.parameter.ts',
    parameterType: 'meta.type.annotation.ts',
    type: 'storage.type.function.ts',
  };

  /**
   * Constructs settings specific to TypeScript
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['get', 'set', 'static', 'public', 'private', 'protected'],
        types: ['any', 'boolean', 'never', 'null', 'number', 'string', 'void',
          'undefined'],
        variables: ['const', 'let', 'var'],
      },
    });

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

  public parserParameterTokens(token: IThemedToken, tokens: Tokens) {
    const { explanation } = token;

    const scopes = explanation[0].scopes;

    const parameter = scopes.find((scope) => {
      return scope.scopeName === this.functionGrammars.parameter;
    });

    if (parameter) {
      tokens.params.push({
        name: explanation[0].content,
        val: '',
      });
    }

    // const parameterType = scopes.find((scope) => {
    //   return scope.scopeName === this.functionGrammars.parameterType;
    // });
  }
}
