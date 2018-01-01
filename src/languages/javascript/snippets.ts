/**
 * JavaScript specific snippet handler
 * 
 * Contains list of snippets specific to JavaScript
 */

import { 
  TextDocument,
  CancellationToken,
  CompletionItem, 
  CompletionItemKind, 
  CompletionItemProvider, 
  Position,
  SnippetString, 
  ProviderResult
} from 'vscode';
import { Snippets, Snippet } from '../../snippets';
import { JavaScript } from './parser';

/**
 * JavaScript specific snippet handler
 * 
 * Used as a communication layer between visual studio code and the DocBlockr 
 * parser
 */
export class JavaScriptSnippets extends Snippets {
  /**
   * List of auto-complete snippets
   */
  protected snippets: Array<Snippet> = [
    {
      name:    '@abstract',
      snippet: '@abstract'
    },
    {
      name:    '@access',
      snippet: '@access  ${1:access}'
    },
    {
      name:    '@alias',
      snippet: '@alias  ${1:alias}'
    },
    {
      name:    '@async',
      snippet: '@async'
    },
    {
      name:    '@augments',
      snippet: '@augments  ${1:namepath}'
    },
    {
      name:    '@author',
      snippet: '@author  ${1:name}  ${2:email}'
    },
    {
      name:    '@borrows',
      snippet: '@borrows  ${1:this}  ${2:that}'
    },
    {
      name:    '@callback',
      snippet: '@callback  ${1:callback}'
    },
    {
      name:    '@classdesc',
      snippet: '@classdesc  ${1:description}'
    },
    {
      name:    '@constant',
      snippet: '@constant  ${1:name}'
    },
    {
      name:    '@constructs',
      snippet: '@constructs  ${1:name}'
    },
    {
      name:    '@copyright',
      snippet: '@copyright  ${1:name} ${2:year}'
    },
    {
      name:    '@default',
      snippet: '@default  ${1:value}'
    },
    {
      name:    '@deprecated',
      snippet: '@deprecated  ${1:description}'
    },
    {
      name:    '@enum',
      snippet: '@enum  ${1:type}'
    },
    {
      name:    '@event',
      snippet: '@event  ${1:event}'
    },
    {
      name:    '@example',
      snippet: '@example'
    },
    {
      name:    '@exports',
      snippet: '@exports  ${1:module}'
    },
    {
      name:    '@external',
      snippet: '@external  ${1:name}'
    },
    {
      name:    '@file',
      snippet: '@file  ${1:description}'
    },
    {
      name:    '@fires',
      snippet: '@fires  ${1:class}'
    },
    {
      name:    '@fires',
      snippet: '@fires  ${1:event}'
    },
    {
      name:    '@function',
      snippet: '@function  ${1:name}'
    },
    {
      name:    '@generator',
      snippet: '@generator'
    },
    {
      name:    '@global',
      snippet: '@global'
    },
    {
      name:    '@hideconstructor',
      snippet: '@hideconstructor'
    },
    {
      name:    '@ignore',
      snippet: '@ignore'
    },
    {
      name:    '@implements',
      snippet: '@implements  ${1:expression}'
    },
    {
      name:    '@inheritdoc',
      snippet: '@inheritdoc'
    },
    {
      name:    '@inner',
      snippet: '@inner'
    },
    {
      name:    '@instance',
      snippet: '@instance'
    },
    {
      name:    '@kind',
      snippet: '@kind  ${1:name}'
    },
    {
      name:    '@lends',
      snippet: '@lends  ${1:name}'
    },
    {
      name:    '@license',
      snippet: '@license  ${1:identifier}'
    },
    {
      name:    '@link',
      snippet: '@link  ${1:url}'
    },
    {
      name:    '@listens',
      snippet: '@listens  ${1:event}'
    },
    {
      name:    '@member',
      snippet: '@member  ${1:type}  ${2:name}'
    },
    {
      name:    '@memberof',
      snippet: '@memberof  ${1:name}'
    },
    {
      name:    '@mixin',
      snippet: '@mixin  ${1:mixin}'
    },
    {
      name:    '@module',
      snippet: '@module  ${1:module}'
    },
    {
      name:    '@name',
      snippet: '@name  ${1:name}'
    },
    {
      name:    '@namespace',
      snippet: '@namespace  ${1:type}  ${2:name}'
    },
    {
      name:    '@override',
      snippet: '@override'
    },
    {
      name:    '@package',
      snippet: '@package'
    },
    {
      name:    '@param',
      snippet: '@param  {${1:type}}  ${2:name}  ${3:description}'
    },
    {
      name:    '@private',
      snippet: '@private'
    },
    {
      name:    '@property',
      snippet: '@property  {${1:type}}  ${2:name}  ${3:description}'
    },
    {
      name:    '@protected',
      snippet: '@protected'
    },
    {
      name:    '@public',
      snippet: '@public'
    },
    {
      name:    '@readonly',
      snippet: '@readonly'
    },
    {
      name:    '@requires',
      snippet: '@requires  ${1::name}]'
    },
    {
      name:    '@return',
      snippet: '@return  {${1:mixed}}  ${2:description}'
    },
    {
      name:    '@see',
      snippet: '@see  ${1:text}'
    },
    {
      name:    '@since',
      snippet: '@since  ${1:version}'
    },
    {
      name:    '@static',
      snippet: '@static'
    },
    {
      name:    '@summary',
      snippet: '@summary  ${1:summary}'
    },
    {
      name:    '@this',
      snippet: '@this  ${1:this}'
    },
    {
      name:    '@throws',
      snippet: '@throws  ${1:description}'
    },
    {
      name:    '@todo',
      snippet: '@todo  ${1:todo}'
    },
    {
      name:    '@tutorial',
      snippet: '@tutorial  ${1:tutorial}'
    },
    {
      name:    '@type',
      snippet: '@type  ${1:type}'
    },
    {
      name:    '@typedef',
      snippet: '@typedef  ${1:type}  ${2:name}'
    },
    {
      name:    '@version',
      snippet: '@version  ${1:number}'
    },
    {
      name:    '@yields',
      snippet: '@yields  ${1:type}  ${2:description}'
    },
  ];

  /**
   * Get instance of JavaScript code parser
   */
  public constructor() {
    super(new JavaScript());
  }
}