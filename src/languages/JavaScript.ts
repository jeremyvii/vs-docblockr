'use strict';

import { Parser, Lexed, Param, Parsed } from '../Parser';
import { Settings, Options }            from '../Settings';
import * as vscode                      from 'vscode';

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

export class JavaScript extends Parser {
  constructor() {
    super({
      grammer: {
        function: 'function',
        class: 'class'
      }
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
      // Get end of line position
      let eos = this.findByType('eos', lexed);
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
      name: null,
      params: [],
      return: {
        present: true,
        type: ''
      }
    }
    // Loop for indicating that our next lexed object should contain a class, 
    // function, or variable name
    var expectName = false;
    // Iterate over list of lexed arrays
    for (let i in lexed) {
      // Iterate over lexed objects
      lexed[i].forEach(element => {
        // Determine what action by the object type
        if (element.type === 'tag') {
          // Check if element value is a class or function statement
          if (element.val === this.settings.grammer.function) {
            // Indicate the next object should be a class, or function
            expectName = true;
          } else if (expectName) {
            // Apply function to parsed function property
            parsed.name = element.val;
            // Indicate we are no longer expecting a class or function name
            expectName = false;
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
}