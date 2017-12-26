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
 * Lexed code after it has been tokenized
 */
export interface Tokens {
  name: string,
  type: string,
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
    let lexed = this.tokenize(nextLine.text);
    // Create doc block string from parsed code
    let blockString = this.renderBlock(lexed);
    // Get a position object based off the current cursor location
    let position = new Position(current.line, current.character);
    // Run edit command on text editor
    editor.edit(function(edit) {
      // Insert docblock into text editor
      edit.insert(position, blockString);
    });
  }

  /**
   * Checkes if token from lexed object matches any grammer settings
   * 
   * @param   {string}   token  Potiential token name
   * @param   {string}   type   Optionally grammer type to check against
   * 
   * @return  {boolean}         True if token name exists in grammer
   */
  public matchesGrammer(token: string, type: string = ''): boolean {
    // Loop over grammer properties
    for (let grammer in this.settings.grammer)
      // Check if token matches grammer type provided
      if (this.settings.grammer.hasOwnProperty(type))
        return this.settings.grammer[type] === token;
      // Check if the token being checked has a grammer setting
      else if (this.settings.grammer[grammer] === token)
        // Indicate that this is a token name
        return true;
    // Return false by default
    return false;
  }

  /**
   * Renders docblock string based on tokenized object
   *
   * @param   {Tokens}  tokens  Tokenized docblock object
   *
   * @return  {string}          Generated docblock string
   */
  public renderBlock(tokens: Tokens): string {
    // Create new array for each doc block line
    let blockList = [];
    // Function description
    blockList.push(`[${tokens.name} description]`);
    // Check if there are any function parameters
    if (tokens.params.length) {
      // Empty line
      blockList.push('');
      // Get maximum number of characters from param names
      let max = tokens.params.map(param => param.name.length)
        .reduce((a, b) => Math.max(a, b));
      // Iterator over list of parameters
      tokens.params.forEach(param => {
        // Calculate difference in string size
        let diff = max - param.name.length;
        // Calculate total param name spaces
        let spaces = Array(3 + diff).join(' ');
        // Append param to docblock
        blockList.push(
          `@param   {[type]}  ${param.name}${spaces}[${param.name} description]`);
      });
    }
    // Check if return section should be displayed
    if (tokens.return.present && tokens.type === this.settings.grammer.function) {
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

 /**
   * Create tokenized object based off of the output from the Pug Lexer
   *
   * @param   {string}  code    Code to lex via the bug lexer
   * @param   {string}  next    Token name from previous function instance. Used 
   *                            for letting the `tokenize` method now it should 
   *                            be expecting a token name
   * @param   {Tokens}  tokens  Tokens created from the previous tokenize 
   *                            instance
   *
   * @return  {Tokens}          Tokens retrieved from Pug Lexer output
   */
  public tokenize(code: string, next: string = '', tokens: any = {}) {
    return tokens;
  }

  dispose() {
    this._disposable.dispose();
  }
}
