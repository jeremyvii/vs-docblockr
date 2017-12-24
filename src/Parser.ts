'use strict';

import Lexer                         from 'pug-lexer';
import { Grammer, Options, Settings} from './Settings';
import * as vscode                   from 'vscode';

import Window           = vscode.window;
import QuickPickItem    = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Document         = vscode.TextDocument;
import Position         = vscode.Position;
import Range            = vscode.Range;
import Selection        = vscode.Selection;
import TextDocument     = vscode.TextDocument;
import TextEditor       = vscode.TextEditor;
import Disposable       = vscode.Disposable;

/**
 * Lexed code returned from the pug lexed
 */
export interface Lexed {
  col:   number,
  line:  number,
  name?: string,
  type:  string,
  val?:  string
}

/**
 * Function parameter
 */
export interface Param {
  name: string,
  val: string  
}

/**
 * Lexed code after it has been parsed
 */
export interface Parsed {
  name: string,
  return?: {
    present: boolean,
    type?: string    
  }
  params?: Array<Param>
}

/**
 * Inital Class for parsing Doc Block comments
 */
export class Parser {
  /**
   * Things to get rid of when we are done
   * 
   * @var {Disposable}
   */
  private _disposable: Disposable;
  
  private identifier: string = '[a-zA-Z_$][a-zA-Z_$0-9]+';

  /**
   * The Pug Lexer
   * 
   * This is used to lex the function needing to be doc blocked
   * 
   * @var  {Lexer}
   */
  public lexer: Lexer;

  /**
   * Language specific parser settings
   * 
   * @var  {Settings}
   */
  public settings: Settings;

  constructor(options: Options) {
    // Get instance of pug lexer
    this.lexer = require('pug-lexer');
    // Get instance of language settings
    this.settings = new Settings(options);
  }

  /**
   * Searches lexed objects by the type property
   * 
   * @param   {string}        type       Type value to search for
   * @param   {Array<Lexed>}  lexedObjs  List of lexed objects
   * 
   * @return  {Lexed|null}               Lexed object found, null if no result 
   *                                     was found
   */
  public findByType(type: string, lexedObjs: Lexed[]): Lexed | null {
    // Intialize result as null
    let result = null;
    // Iterate over lexed objects
    for (let i in lexedObjs) {
      // Check if type value matches
      if (lexedObjs[i].type === type) { 
        // Return lexed object
        result = lexedObjs[i];
      }
    }
    return result;
  }

  /**
   * Parses code block and generates doc block for said code block
   * 
   * @param   {TextDocument}  doc     The content of the editor
   * @param   {array}         parsed  List of parsed data
   * 
   * @return  {void} 
   */
  public init(editor: TextEditor): void {
    // Get document from text editor
    let doc = editor.document;
    // Current position of cursor
    let current = Window.activeTextEditor.selections[0].active;
    // Get line below current position
    let nextLine = doc.lineAt(current.line + 1);
    // Lex code below our cursor location
    let lexed = this.lex(nextLine.text);
    // Parse lexed code
    let parsed = this.parse(lexed);
    // Create doc block string from parsed code
    let blockString = this.renderBlock(parsed);
    // Get a position object based off the current cursor location
    let position = new Position(current.line, current.character);
    // Run edit command on text editor
    editor.edit(function(edit) {
      // Insert docblock into text editor
      edit.insert(position, blockString);
    });
  }

  /**
   * Lex code with the pug lexer
   * 
   * Recursively lex the code provided with the pug lexer.
   * The code is broken up into an array of array's return by the pug lexer.
   * The first dimension is recursivly filled up util the end of the intial code 
   * sring is reached. The end of the code string is defined by the pug lexer
   * [
   *   [
   *     { What was lexed },
   *     { What is up next },
   *     { Information abou the end of the line }
   *   ]
   * ]
   * 
   * @param  {string}     code  Code to lex
   * @param  {array}      data  List of parsed data
   * 
   * @return {Lexed[][]}        The data parameter with lexed information
   */
  public lex(code: string, data: Array<any> = []): Lexed[][] {
    return data;
  }

  /**
   * Parses the lexed data to retrieve data relevent to doc block
   * 
   * @see    `this.lex(code: string, data: Array<any> = []): Lexed[][]`
   * 
   * @param   {Lexed[][]}  lexed  Lexed code
   * 
   * @return  {Parsed}            The parsed code
   */
  public parse(lexed: Lexed[][]): Parsed {
    // Define our parsed object
    let parsed: Parsed = {
      name: null,
      params: [],
      return: {
        present: true,
        type: ''
      }
    }
    return parsed;
  }

  /**
   * Renders docblock string based on parsed object
   * 
   * @param   {Parsed}  parsed  Parsed docblock object
   * 
   * @return  {string}          Generated docblock string
   */
  public renderBlock(parsed: Parsed): string {
    // Create new array for each doc block line
    let blockList = [];
    // Function description
    blockList.push(`[${parsed.name} description]`);
    // Check if there are any function parameters
    if (parsed.params) {
      // Empty line
      blockList.push('');
      // Iterator over list of parameters
      parsed.params.forEach(param => {
        // Append param to docblock
        blockList.push(`@param   {[type]}  ${param.name}  [${param.name} description]`);
      });
    }
    // Check if return section should be displayed
    if (parsed.return.present) {
      // Empty line
      blockList.push('');
      // Return type
      blockList.push('@return  {[type]}')
    }
    // Shortcut of end of string variable
    let eos = this.settings.eos;
    // Format and return docblock string
    return this.settings.commentOpen + eos + blockList.map(blockLine => {
      return this.settings.separator + blockLine;
    }).join(eos) + eos + this.settings.commentClose;
  }

  dispose() {
    this._disposable.dispose();
  }
}
