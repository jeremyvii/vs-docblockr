'use strict';

import {ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, 
  window, Disposable, SnippetString, Position} from 'vscode';

import Lexer from 'pug-lexer';
import { read } from 'fs';

/**
 * Lexed code returned from the pug lexed
 */
interface Lexed {
  [key: string]: string,
}

/**
 * Function parameter
 */
interface Param {
  name: string,
  val: string  
}

/**
 * Lexed code after it has been parsed
 */
interface Parsed {
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

  constructor() {
    this.lexer = require('pug-lexer');
  }

  /**
   * Parses function and generates doc block for said function
   * 
   * @param   {TextDocument}  doc     The content of the editor
   * @param   {array}         parsed  List of parsed data
   * 
   * @return  {void} 
   */
  public parseFunction(doc: TextDocument): void { 
    // Ensure lanaguage is javascript
    if (doc.languageId == 'javascript') {
      let docContent = doc.getText();
      let subcriptions: Disposable[] = [];
      // Current position of cursor
      let currPosition = window.activeTextEditor.selections[0].active;
      // Get line below current position
      let nextLine = doc.lineAt(currPosition.line + 1);
      let lexed = this.lex(nextLine.text);
      console.log(lexed);
      console.log(this.renderBlock(this.parse(lexed)));
      // console.log(JSON.stringify(this.lexer(nextLine.text), null, '  '));
    }
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
      var lexed = this.lexer(code);
      // Get current line position
      var current = lexed[1].col;
      // Get end of line position
      var eos = lexed[2].col;
      // Check if the end of the line has been reacher
      if (current !== eos) {
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
    // Start of docblock string
    let commentOpener = '/**\n';
    // End of docblock string
    let commentCloser = '\n */';
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
      blockList.push(`{[type]}  ${param.name}  [${param.name} description]`);
    });
    // // Empty line
    // blockList.push('');
    // Format and return docblock string
    return commentOpener + blockList.map(blockLine => {
      return separator + blockLine;
    }).join('\n') + commentCloser;
  }

  dispose() {
    this._disposable.dispose();
  }
}
