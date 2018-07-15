/**
 * TypeScript specific language parser
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

export class TypeScript extends Parser {
  /**
   * Constructs settings specific to TypeScript
   */
  constructor() {
    super({
      grammar: {
        function: 'function',
        class: 'class',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['get', 'set', 'static', 'public', 'private', 'protected'],
        variables: ['const', 'let', 'var'],
        types: ['any', 'boolean', 'never', 'null', 'number', 'string', 'void', 
          'undefined'],
      }
    });
  }

  /**
   * Create tokenized object based off of the output from the Lexer
   * 
   * @param   {string}  code    Code to lex via the bug lexer
   * @param   {string}  next    Token name from previous function instance. Used
   *                            for letting the `tokenize` method now it should
   *                            be expecting a token name
   * @param   {mixed}   tokens  Tokens created from the previous tokenize
   *                            instance
   * 
   * @return  {Tokens}          Tokens retrieved from Lexer output
   */
  public tokenize(code: string, next: string = '', tokens: Tokens = null): Tokens {
    // Create empty token object if none is present
    if (tokens === null) {
      tokens = {name: '', type: '', params: [], return: { present: true }};
    }
    // Make sure code provided isn't undefined
    if (code !== undefined) {
      // Strip spaces from parameters with return types defined
      // Prevents lexer from thinking the return type is the variable
      code = ((): string => {
        // Prevent lexer errors by stripping out semi-colons
        code = code.replace(';', '');
        // Expression to check for function parameters
        let expression = /([a-zA-Z_$0-9]+):(\s?)([a-zA-Z_$0-9]+)/;
        // If the expression finds nothing return the original code
        if (!expression.test(code)) return code;
        // Get matches from expression
        let matches = expression.exec(code);
        // Strip space from parameter
        return code.replace(matches[0], `${matches[1]}:${matches[3]}`);
      })();
      // Create shortcut to identifier string
      let identifier = this.settings.grammar.identifier;
      // Lex code string provided
      let lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      let result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      let text = this.findByType('text', lexed);
      // Get end of line position
      let eos = this.findByType('eos', lexed);
      // Get code lexed object if exists this is used for variable blocks
      let codeLexed = this.findByType('code', lexed);
      // Check if first lexed token is a function
      let isFunction = this.matchesGrammar(result.val, 'function');
      // Check if first lexed token is a class
      let isClass = this.matchesGrammar(result.val, 'class');
      // Check if we have gotten a token value
      if (isFunction || isClass) {
        // Append matched token to token type
        tokens.type = result.val;
        // The next time this function is ran,
        // indicate that it should expect a name
        next = result.val;
        // Remove return tag if code is a class
        if (isClass) tokens.return.present = false;
      }  else if (codeLexed) {
        // Set token name
        tokens.name = result.val;
        // Set token type
        tokens.type = 'variable';
        // Indicate no return type since this is a variable token
        tokens.return.present = false
        // Return token as is
        return tokens;
      // Check for function variables let, var, etc.
      } else if (this.matchesGrammar(result.val, 'variables')) {
        // Create regular expression object for finding function variables
        let funcRegex = new RegExp(`(${identifier}+) = (${this.settings.grammar.function})`);
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
        // Indicate code is a variable
        tokens.type = 'variable';
        // Variables should not have return types
        tokens.return.present = false;
      } else if (this.matchesGrammar(result.val, 'modifiers')) {
        // Recursively find function name based on modifiers
        let findName = (string: string): string => {
          // Get lexed tokens from string
          let lexed = this.lex(string);
          // Assume first tag token found is the function name
          let tag = lexed.filter((obj) => {
            return obj.type === 'tag' && obj.line === 1 && obj.col === 1;
          }).pop();
          // Get text token
          let text = this.findByType('text', lexed);
          // If result is a modifier lex the remaining code
          if (this.matchesGrammar(tag.val, 'modifiers')) {
            findName(text.val);
          } else {
            return tag.val;
          }
        };
        // Expression for checking of code is a function or property
        let funcRegex = new RegExp(/([a-zA-Z_$0-9]+)(\s?)\((.*)\)/);
        // Set token name and type
        tokens.name = findName(text.val);
        tokens.type = 'variable';
        // Set no return value if code is a class property
        tokens.return.present = false;
        // Check if code is a function
        if (funcRegex.test(code)) {
          // Indicate that code is a function and display return type
          tokens.type = 'function';
          tokens.return.present = true;
        }
      } else if (this.matchesGrammar(next)) {
        // Set the tokens name
        tokens.name = result.val;
      }
      // Check for any parameters in lexed array by checking for a start
      // attribute type
      if (this.findByType('start-attributes', lexed)) {
        // Iterate over lexed objects
        for (let i in lexed) {
          /* 
          Expression that separates function argument from argument type. This 
          separation between the two is delimited by a colon (`:`)
          */
          let argTypeRegex = new RegExp(/([a-zA-Z_$][0-9a-zA-Z_$]*):([a-zA-Z_$][0-9a-zA-Z_$]*)/);
          // Check if object is an attribute
          if (lexed[i].type === 'attribute') {
            // By default set name to whatever the lexer returned
            let name = lexed[i].name;
            // Initialize parameter type
            let type;
            // Test parameter name against expression to check for type
            if (argTypeRegex.test(name)) {
              // Separate parameter type from name
              let matches = argTypeRegex.exec(name);
              // Get name from match
              name = matches[1];
              // Get parameter type from match
              type = matches[2];
            }
            // Create new param object based lexed object
            let param: Param = {
              name: name,
              val:  lexed[i].val
            }
            // Indicate return type if any was found
            if (type) param.type = type;
            // Push param to parameter list
            tokens.params.push(param);
          }
        }
        // Since parameters are being parsed, the proceeding tags could contain 
        // a return type. Upon searching the objects for the `:` character,  
        // the proceeding object could contain a valid return type
        let colon = this.findByType(':', lexed);
        if (colon !== null) {
          // The next value could be a return type
          let returnLexed = lexed[colon.index + 1];
          // Guesses if value is a return type by checking if the first 
          // character is capitalized
          let classRegex = new RegExp(/^[A-Z][a-zA-Z0-9_]+/);
          // Check if next value is a return type
          if (this.matchesGrammar(returnLexed.val, 'types') ||
            classRegex.test(returnLexed.val)) {
            // Set guess return type
            tokens.return.type = returnLexed.val;
          }
        }
      }
      // Check if the end of the line has been reached
      if (text && text.col < eos.col) {
        // Create new regular expression object based on grammar identifier
        let cleanExp = new RegExp('^' + this.settings.grammar.identifier);
        // Make sure we aren't about to lex malformed input
        if (cleanExp.test(text.val.substr(0, 1))) {
          // Continue the lexing process and the data up next
          this.tokenize(text.val, next, tokens);
        }
      }
      // Check if a name was set.
      if (!tokens.name) {
        // If not, assume the tag value should be the token's name
        tokens.name = result.val;
      }
    }
    return tokens;
  }


  /**
   * Renders parameter tag template for docblock. This method is
   * being overwritten in order to wrap `{}` around binding types
   * 
   * Arguments c, t, p should be assumed to be computed by `renderParamTags()`.
   * These ambigious argument names simply refer to the spaces between columns.
   * 
   * @param   {string}  c     Spaces computed between inital tag and param type
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
    desc: string): string {
    return `@param${c} {${type}}${t}${name}${p}${desc}`;
  }

  /**
   * Renders return tag with return type and computed spacing. This method is
   * being overwritten in order to wrap `{}` around binding types
   * 
   * @param   {string}  columns  Computed spaces between tag and type 
   * @param   {string}  type     Type associated with return value (in docblock 
   *                             not this method)
   * 
   * @return  {string}           Rendered return tag 
   */
  public getReturnTag(columns: string, type: string): string {
    return `@return${this.columns}{${type}}`;
  }

  /**
   * Renders var tag with property type and computed spacing. This method is 
   * being overwritten in order to wrap `{}` around binding types 
   * 
   * @param   {string}  columns  Computed spaces between tag and type 
   * @param   {string}  type     Type associated with property value (in docblock
   *                             not this method)
   * 
   * @return  {string}           Rendered property tag 
   */
  public getVarTag(columns: string, type: string): string {
    return `@var${this.columns}{${type}}`;
  }
}