/**
 * JavaScript specific language parser
 */

'use strict';

import { Parser, Lexed, Param, Tokens } from '../parser';
import { Settings, Options }            from '../settings';
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
  /**
   * Constructs settings specific to JavaScript
   */
  constructor() {
    super({
      grammer: {
        function: 'function',
        class: 'class',
        modifiers: ['const', 'let', 'var'],
        identifier: '[a-zA-Z_$0-9]'
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
      // Lex code string provided
      let lexed = this.lexer(code);
      // Get current line position
      let current = this.findByType('text', lexed);
      // Get end of line position
      let eos = this.findByType('eos', lexed);
      // Create shortcut to indentifier string
      let indentifier = this.settings.grammer.identifier;
      // Create regular expression for finding function prototypes
      let regex = new RegExp('(' + indentifier + '+)\.prototype\.(' + indentifier + '+)');
      // Get code lexed object if exists this is used for variable blocks
      let codeLexed = this.findByType('code', lexed);
      // Check if we have gotten a token value
      if (this.matchesGrammer(lexed[0].val, 'function') ||
          this.matchesGrammer(lexed[0].val, 'class')) {
        // Append matched token to token type
        tokens.type = lexed[0].val;
        // The next time this function is ran,
        // indicate that it should expect a name
        next = lexed[0].val;
      // Add special case for prototype functions
      } else if (regex.test(code)) {
        // Get regular expression result
        let result = regex.exec(code);
        // Indicate we have a function in our token
        tokens.type = this.settings.grammer.function;
        // Set function name
        tokens.name = result[2];
        // Clean malformed input to prevent errors in the Pug Lexer
        current.val = current.val.replace('= ', '');
      // Get variable properties
      } else if (codeLexed) {
        // Set token name
        tokens.name = lexed[0].val;
        // Set token type
        tokens.type = 'variable';
        // Return token as is
        return tokens;
      // Check for function modifiers let, var, etc.
      } else if (this.matchesGrammer(lexed[0].val, 'modifiers')) {
        // Create regular expression object for finding function variables
        let funcRegex = new RegExp('(' + indentifier + '+) = (' + this.settings.grammer.function + ')');
        // Check if regular expression matches code next up to lexed
        if (funcRegex.test(current.val)) {
          // Get matches from regular expression
          let result = funcRegex.exec(current.val);
          // Get function parameters from string
          let params = current.val.replace(result[1] + ' = ' + result[2], '');
          // Swap function name and statement to prevent pug lexer errors
          current.val = result[2] + ' ' + result[1] + params;
        } else {
          // Strip spaces from code to help pug lexer
          current.val = current.val.replace(' = ', '=').replace(';', '');
        }
      } else if (this.matchesGrammer(next)) {
        // Set the tokens name
        tokens.name = lexed[0].val;
      }
      // Check for any parameters in lexed array by checking for a start
      // attribute type
      if (this.findByType('start-attributes', lexed)) {
        // Iterate over lexed objects
        for (let i in lexed) {
          // Check if object is an attribute
          if (lexed[i].type === 'attribute') {
            // Create new param object based lexed object
            let param: Param = {
              name: lexed[i].name,
              val:  lexed[i].val
            }
            // Push param to parameter list
            tokens.params.push(param);
          }
        }
      }
      // Check if the end of the line has been reached
      if (current.col < eos.col) {
        // Create new regular expression object based on grammer identifier
        let regex = new RegExp('^' + this.settings.grammer.identifier);
        // Make sure we aren't about to lex malformed input
        if (regex.test(current.val.substr(0, 1))) {
          // Continue the lexing process and the data up next
          this.tokenize(current.val, next, tokens);
        }
      }
    }
    return tokens;
  }
}