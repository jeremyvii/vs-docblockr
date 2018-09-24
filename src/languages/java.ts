/**
 * Java specific language parser
 */

'use strict';

import { Param, Parser, Tokens } from '../parser';

export class Java extends Parser {
  /**
   * Constructs settings specific to Java
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['abstract', 'final', 'native', 'none', 'private',
          'protected', 'public', 'strictfp', 'static', 'synchronized',
          'transient', 'volatile'],
        types: ['boolean', 'byte', 'char', 'double', 'float', 'int',
          'long', 'short', 'void'],
        variables: ['const', 'let', 'var'],
      },
    });
  }

  /**
   * Create tokenized object based off of the output from the Lexer
   *
   * @param   {string}  code    Code to lex via the lexer
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
    // Don't continue unless we have workable value
    if (code !== undefined) {
      // Get logical OR expression for determining variables type. This is
      // based on types defined in grammar settings, and expression for sentence
      // case class names
      const varTypes = this.settings.grammar.types.concat('^[A-Z][a-zA-Z]+').join('|');
      // Short cut to valid variable name
      const ident = this.settings.grammar.identifier;
      // Expression for determine and parsing Java variable (not property)
      const varExp = new RegExp(`(${varTypes})[\\s]{0,}(${ident}+)[\\s]{0,}[=]{0,1}[\\s]{0,}(.*);$`);
      if (varExp.test(code)) {
        const matches = varExp.exec(code);
        // Set up variable token
        tokens.name = matches[2];
        tokens.type = 'variable';
        tokens.varType = matches[1];
        tokens.return.present = false;
        // Since the match form the variable expression should have found
        // everything needed to set up variable token, no further processing is
        // needed
        return tokens;
      }
      // Separate code string with lexer
      const lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      const result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);
      // Check if first lexed token is a class
      const isClass = this.matchesGrammar(result.val, 'class');
      if (isClass) {
        // Append matched token to token type
        tokens.type = result.val;
        // The next time this function is ran,
        // indicate that it should expect a name
        next = result.val;
        // Classes should not have return tags
        tokens.return.present = false;
      } else if (this.matchesGrammar(result.val, 'modifiers')) {
        // Recursively find function name from code string
        const findName = (codeString: string): string => {
          // Get list of lexed objects from code string
          const newLexed = this.lex(codeString);
          // Assume first tag token found is the function name
          const tag = newLexed.filter((obj) => {
            return obj.type === 'tag' && obj.line === 1 && obj.col === 1;
          }).pop();
          // Get the code next up to be lexed
          const nextCode = this.findByType('text', newLexed);
          // Check if tag is is a variable or function modifier, or is a
          // variable type
          if (this.matchesGrammar(tag.val, 'types') || /^[A-Z][a-zA-Z]+/.test(tag.val)) {
            // Since this value seems to be a variable type set it to the
            // return type token
            tokens.return.type = tag.val;
            return findName(nextCode.val);
          } else if (this.matchesGrammar(tag.val, 'modifiers')) {
            return findName(nextCode.val);
          } else {
            return tag.val;
          }
        };
        // Expression for checking of code is a function or property
        const funcRegex = new RegExp(/([a-zA-Z_$0-9]+)(\s?)\((.*)\)/);
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
        } else {
          // Since this code is not a function, assume it is a property or
          // variable and move the return type to the variable type
          tokens.varType = tokens.return.type;
          tokens.return.type = '';
        }
      } else if (this.matchesGrammar(next)) {
        // Set the token's name
        tokens.name = result.val;
        // Set next argument so we don't override class name with potential
        // modifier names
        next = '';
      }
      // Check for any parameters in lexed array by checking for a start
      // attribute type
      if (this.findByType('start-attributes', lexed)) {
        let paramNext: string = '';
        // Iterate over lexed objects
        for (const i in lexed) {
          // Check if object is an attribute
          if (lexed[i].type === 'attribute') {
            // Check if attribute is a potential language type
            if (this.matchesGrammar(lexed[i].name, 'types') ||
              /^[A-Z][a-zA-Z]+/.test(lexed[i].name)) {
              // Indicate that the next parameter is this type
              paramNext = lexed[i].name;
            } else {
              // Create new param object based lexed object
              const param: Param = {
                name: lexed[i].name,
                val: lexed[i].val,
              };
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
      }
      // Check if the end of the line has been reached
      if (text && text.col < eos.col) {
        // Create new regular expression object based on grammar identifier
        const cleanExp = new RegExp('^' + this.settings.grammar.identifier);
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
