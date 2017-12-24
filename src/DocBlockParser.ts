'use strict';

import Lexer                         from 'pug-lexer';
import { Grammer, Options, Settings} from './settings';
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
  [key: string]: string,
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
  function: string,
  params: Array<Param>
}

/**
 * Inital Class for parsing Doc Block comments
 */
export class DocBlockParser {
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
   * Parses function and generates doc block for said function
   * 
   * @param   {TextDocument}  doc     The content of the editor
   * @param   {array}         parsed  List of parsed data
   * 
   * @return  {void} 
   */
  public parseFunction(editor: TextEditor): void {
    // Get document from text editor
    let doc = editor.document;
    // Current position of cursor
    let currPosition = Window.activeTextEditor.selections[0].active;
    // Get line below current position
    let nextLine = doc.lineAt(currPosition.line + 1);
    // Lex code below our cursor location
    let lexed = this.lex(nextLine.text);
    // Parse lexed code
    let parsed = this.parse(lexed);
    // Create doc block string from parsed code
    let blockString = this.renderBlock(parsed);
    // Get a position object based off the current cursor location
    let position = new Position(currPosition.line, currPosition.character);
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
    // Make sure code provided isn't undefined
    if (code !== undefined) {
      // Lex code string provided
      let lexed = this.lexer(code); 
      // Get current line position
      let current = this.findByType('text', lexed);
      console.log(current);
      // Get end of line position
      let eos = this.findByType('eos', lexed);
      console.log(eos);
      // Check if the end of the line has been reacher
      if (current.col !== eos.col) {
        // Push to the lexed objects to list
        data.push(lexed);
        // Continue the lexing process and the data up next
        this.lex(lexed[1].val, data);
      }
    }
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
      function: null,
      params: []
    }
    // Loop for indicating that our next lexed object should contain a function 
    // name
    var expectFunction = false;
    // Iterate over list of lexed arrays
    for (let i in lexed) {
      // Iterate over lexed objects
      lexed[i].forEach(element => {
        // Determine what action by the object type
        if (element.type === 'tag') {
          // Check if element value is the function modifier
          if (element.val === 'function') {
            // Indicate the next object should be a function
            expectFunction = true;
          } else if (expectFunction) {
            // Apply function to parsed function property
            parsed.function = element.val;
            // Indicate we are no longer expecting a function
            expectFunction = false;
          }
        } else if (element.type === 'attribute') {
          // Create a param object from lexed object
          let param: Param = {
            name: element.name,
            val:  element.val              
          }
          // Push lexed Param object to list of params
          parsed.params.push(param);
        }      
      });      
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
    // Separator at the begining of each docblock line
    let separator = ' * ';
    // Create new array for each doc block line
    let blockList = [];
    // Function description
    blockList.push(`[${parsed.function} description]`);
    // Empty line
    blockList.push('');
    // Iterator over list of parameters
    parsed.params.forEach(param => {
      // Append param to docblock
      blockList.push(`@param   {[type]}  ${param.name}  [${param.name} description]`);
    });
    // Empty line
    blockList.push('');
    // Return type
    blockList.push('@return  {[type]}')
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
