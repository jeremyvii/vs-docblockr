/**
 * JavaScript specific language parser
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

export class JavaScript extends Parser {
  /**
   * Constructs settings specific to JavaScript
   */
  constructor() {
    super({
      grammer: {
        function: 'function',
        class: 'class',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['get', 'set', 'static'],
        variables: ['const', 'let', 'var'],
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
      let lexed = this.lex(code);
      console.log(lexed);
      // The initial lexed object is the result of what was lexed
      let result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      let text = this.findByType('text', lexed);
      // Get end of line position
      let eos = this.findByType('eos', lexed);
      // Get code lexed object if exists this is used for variable blocks
      let codeLexed = this.findByType('code', lexed);
      // Create shortcut to indentifier string
      let indentifier = this.settings.grammer.identifier;
      // Create regular expression for finding function prototypes
      let protoExp = new RegExp(`(${indentifier}+)\.prototype\.(${indentifier}+)`);
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

      // Add special case for prototype functions
      } else if (protoExp.test(code)) {
        // Get regular expression result
        let result = protoExp.exec(code);
        // Indicate we have a function in our token
        tokens.type = this.settings.grammer.function;
        // Set function name
        tokens.name = result[2];
        // Clean malformed input to prevent errors in the Pug Lexer
        text.val = text.val.replace('= ', '');
      // Get variable properties
      } else if (codeLexed) {
        // Set token name
        tokens.name = result.val;
        // Set token type
        tokens.type = 'variable';
        // Return token as is
        return tokens;
      // Check for function variables let, var, etc.
      } else if (this.matchesGrammer(result.val, 'variables')) {
        // Create regular expression object for finding function variables
        let funcRegex = new RegExp(`(${indentifier}+) = (${this.settings.grammer.function})`);
        // Check if regular expression matches code next up to lexed
        if (funcRegex.test(text.val)) {
          // Get matches from regular expression
          let result = funcRegex.exec(text.val);
          // Get function parameters from string
          let params = text.val.replace(result[1] + ' = ' + result[2], '');
          // Swap function name and statement to prevent pug lexer errors
          text.val = result[2] + ' ' + result[1] + params;
        } else {
          // Strip spaces from code to help pug lexer
          text.val = text.val.replace(' = ', '=').replace(';', '');
        }
      } else if (this.matchesGrammer(result.val, 'modifiers')) {
        // Recursively find function name based on modifiers
        let findName = (string: string): string => {
          // Get lexed tokens from string
          let lexed = this.lex(string);
          // Get tag token
          let tag = this.findByType('tag', lexed);
          // Get text token
          let text = this.findByType('text', lexed);
          // If result is a modifier lex the remaining code
          if (this.matchesGrammer(tag.val, 'modifiers')) {
            findName(text.val);
          } else {
            return tag.val;
          }
        };
        // Set token name and type
        tokens.name = findName(text.val);
        tokens.type = 'function';
      } else if (this.matchesGrammer(next)) {
        // Set the tokens name
        tokens.name = result.val;
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
      if (text.col < eos.col) {
        // Create new regular expression object based on grammer identifier
        let cleanExp = new RegExp('^' + this.settings.grammer.identifier);
        // Make sure we aren't about to lex malformed input
        if (cleanExp.test(text.val.substr(0, 1))) {
          // Continue the lexing process and the data up next
          this.tokenize(text.val, next, tokens);
        }
      }
    }
    return tokens;
  }
}