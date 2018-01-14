/**
 * PHP specific language parser
 */

'use strict';

import { Parser, Param, Tokens } from '../parser';
import { Lexed }                 from '../lexer';
import { Settings, Options }     from '../settings';
import * as vscode               from 'vscode';

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

export class PHP extends Parser {
  /**
   * Constructs settings specific to PHP
   */
  constructor() {
    super({
      grammer: {
        function: 'function',
        class: 'class',
        modifiers: ['public', 'static', 'protected', 'private'],
        identifier: '[a-zA-Z_$0-9]',
        types: ['self', 'array', 'callable', 'bool', 'boolean', 'float', 'int', 
          'integer', 'string', 'iterable']
      }
    });
  }

  /**
   * Create tokenized object based off of the output from the Pug Lexer
   * 
   * @param   {string}  code    Code to lex via the bug lexer
   * @param   {string}  next    Token name from previous function instance. Used
   *                            for letting the `tokenize` method now it should
   *                            be expecting a token name
   * @param   {mixed}   tokens  Tokens created from the previous tokenize
   *                            instance
   * 
   * @return  {Tokens}          Tokens retrieved from Pug Lexer output
   */
  public tokenize(code: string, next: string = '', tokens: Tokens = null): Tokens {
    // Create empty token object if none is present
    if (tokens === null) {
      tokens = {name: '', type: '', params: [], return: { present: true }};
    }
    // Make sure code provided isn't undefined
    if (code !== undefined) {
      // Guess if code is a variable before trying to run it through the lexer
      let varRegex = new RegExp(/([a-zA-Z0-9$]+)[\s]?=[\s]?([a-zA-Z0-9$\(\)\{\}\[\]"'``,\s]+)/);
      // Check if expression has any matchese
      if (varRegex.test(code)) {
        // Get matches from variable expression
        let matches = varRegex.exec(code);
        // Set up variable token
        tokens.name           = matches[1];
        tokens.type           = 'variable';
        tokens.return.present = false;
        return tokens;
      } 
      // Lex code string provided
      let lexed = this.lex(code); console.log(lexed);
      // The initial lexed object is the result of what was lexed
      let result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      let text = this.findByType('text', lexed);
      // Get end of line position
      let eos = this.findByType('eos', lexed);
      // Create shortcut to indentifier string
      let indentifier = this.settings.grammer.identifier;
      // Guesses if value is a return type by checking if the first character 
      // is capitalized
      let classRegex = new RegExp(/^[A-Z][a-zA-Z0-9_]+/);
      // Check if first lexed token is a function
      let isFunction = this.matchesGrammer(result.val, 'function');
      // Check if first lexed token is a class
      let isClass = this.matchesGrammer(result.val, 'class');
      // Check if we have gotten a token value
      if (isFunction || isClass) {
        // Append matched token to token type
        tokens.type = result.val;
        // The next time this function is ran,
        // indicate that it should expect a name
        next = result.val;
        // Remove return tag if code is a class
        if (isClass) tokens.return.present = false;
      // Set block name
      } else if (this.matchesGrammer(next)) {
        // Set the tokens name
        tokens.name = result.val;
      }
      // Check for any parameters in lexed array by checking for a start
      // attribute type
      if (this.findByType('start-attributes', lexed)) {
        let paramNext: string = '';
        // Iterate over lexed objects
        for (let i in lexed) {
          // Check if object is an attribute
          if (lexed[i].type === 'attribute') {
            // Check if attribute is a potiential language type
            if (this.matchesGrammer(lexed[i].name, 'types') || 
              classRegex.test(lexed[i].name)) {
              // Indicate that the next parameter is this type
              paramNext = lexed[i].name;
            } else {
              // Create new param object based lexed object
              let param: Param = {
                name: lexed[i].name,
                val:  lexed[i].val
              }
              // Check if a parameter type was found
              if (paramNext) {
                param.type = paramNext;
                // Make sure all the parameters don't end up with the same type
                paramNext = '';
              }
              // Push param to parameter list
              tokens.params.push(param);
            }
          }
        }
        // Since parameters are being parsed, the proceeding tags could contain 
        // a return type. Upon searching the objects for the `:` character,  
        // the proceeding object could contain a valid return type
        let colon = this.findByType(':', lexed);
        if (colon !== null) {
          // The next value could be a return type
          let returnLexed = lexed[colon.index + 1];
          // Check if next value is a return type
          if (this.matchesGrammer(returnLexed.val, 'types') || 
            classRegex.test(returnLexed.val)) {
            // Set guess return type
            tokens.return.type = returnLexed.val;
          }
        }
      }
      // Check if the end of the line has been reached
      if (text.col < eos.col) {
        // Create new regular expression object based on grammer identifier
        let regex = new RegExp('^' + this.settings.grammer.identifier);
        // Make sure we aren't about to lex malformed input
        if (regex.test(text.val.substr(0, 1))) {
          // Continue the lexing process and the data up next
          this.tokenize(text.val, next, tokens);
        }
      }
    }
    console.log(tokens);
    return tokens;
  }
}
