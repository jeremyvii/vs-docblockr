/**
 * TypeScript specific language parser
 */

'use strict';

import { Parser } from '../parser';
import { Param, Tokens } from '../tokens';

export class TypeScript extends Parser {
  /**
   * Constructs settings specific to TypeScript
   */
  constructor() {
    super({
      grammar: {
        class: 'class',
        function: 'function',
        identifier: '[a-zA-Z_$0-9]',
        modifiers: ['get', 'set', 'static', 'public', 'private', 'protected'],
        types: ['any', 'boolean', 'never', 'null', 'number', 'string', 'void',
          'undefined'],
        variables: ['const', 'let', 'var'],
      },
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
  public tokenize(
    code: string,
    next: string = '',
    tokens: Tokens = new Tokens(),
  ): Tokens {
    // Make sure code provided isn't undefined
    if (code !== undefined) {
      // Strip spaces from parameters with return types defined
      // Prevents lexer from thinking the return type is the variable
      code = ((): string => {
        // Prevent lexer errors by stripping out semi-colons
        code = code.replace(';', '');
        // Create an expression for finding any function parameters
        const paramsExp = /\(([\w$:\s,\[\]]+)\)/;
        // If no results are found based on expression, return code as is
        if (!paramsExp.test(code)) return code;
        // Grab parameter section of function
        const paramsMatch = paramsExp.exec(code);
        // Assume the second result in the list are the parameters and split
        // based on comma
        const params = paramsMatch[1].split(', ');
        // Remove whitespace between trailing colon and parameter type in order
        // to prevent lexer errors
        const paramsFormatted = params.map((param) => {
          return param.replace(/\s/g, '');
        }).join(', ');
        // Strip space from parameter
        return code.replace(paramsMatch[0], `(${paramsFormatted})`);
      })();
      // Create shortcut to identifier string
      const identifier = this.settings.grammar.identifier;
      // Check for possible functions getting assigned to object properties
      const objExp = new RegExp(`(${identifier}+) = (${this.settings.grammar.function}+)`);
      if (objExp.test(code)) {
        // Ensure no `.` characters are sent to lexer, the last item split is
        // assumed to be the expression name
        code = code.split('.').pop();
        const match = objExp.exec(code);
        tokens.type = this.settings.grammar.function;
        // Assume first match is the function name
        tokens.name = match[1];
        // Remove expression match from code string in order to pass remaining
        // data along to lexer
        const expression = code.replace(match[0], '');
        // Strip leading equal sign to prevent lexer from assuming input is
        // malformed
        code = expression.replace('=', '').trim();
      }
      // Lex code string provided
      const lexed = this.lex(code);
      // The initial lexed object is the result of what was lexed
      const result = lexed[0];
      // The lexed object with the text type is what is next to be lexed
      const text = this.findByType('text', lexed);
      // Get end of line position
      const eos = this.findByType('eos', lexed);
      // Get code lexed object if exists this is used for variable blocks
      const codeLexed = this.findByType('code', lexed);
      // Check if first lexed token is a function
      const isFunction = this.matchesGrammar(result.val, 'function');
      // Check if first lexed token is a class
      const isClass = this.matchesGrammar(result.val, 'class');
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
        tokens.return.present = false;
        // Return token as is
        return tokens;
      // Check for function variables let, var, etc.
      } else if (this.matchesGrammar(result.val, 'variables')) {
        // Create regular expression object for finding function variables
        const funcRegex = new RegExp(`(${identifier}+) = (${this.settings.grammar.function})`);
        // Check if regular expression matches code next up to lexed
        if (funcRegex.test(text.val)) {
          // Get matches from regular expression
          const match = funcRegex.exec(text.val);
          // Get function parameters from string
          const params = text.val.replace(match[1] + ' = ' + match[2], '');
          // Swap function name and statement to prevent pug lexer errors
          text.val = match[2] + ' ' + match[1] + params;
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
        const findName = (name: string): string => {
          // Get lexed tokens from string
          const newLexed = this.lex(name);
          // Assume first tag token found is the function name
          const tag = newLexed.filter((obj) => {
            return obj.type === 'tag' && obj.line === 1 && obj.col === 1;
          }).pop();
          // Get text token
          const nextName = this.findByType('text', lexed);
          // If result is a modifier lex the remaining code
          if (this.matchesGrammar(tag.val, 'modifiers')) {
            findName(nextName.val);
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
        }
      } else if (this.matchesGrammar(next)) {
        // Set the tokens name
        tokens.name = result.val;
      }
      // Check for any parameters in lexed array by checking for a start
      // attribute type
      if (this.findByType('start-attributes', lexed)) {
        // Iterate over lexed objects
        for (const i in lexed) {
          if (lexed.hasOwnProperty(i)) {
            /*
            Expression that separates function argument from argument type. This
            separation between the two is delimited by a colon (`:`)
            */
            const argTypeRegex = new RegExp(/([a-zA-Z_$][\w$]*):([a-zA-Z_$][\w$\[\]]*)/);
            // Check if object is an attribute
            if (lexed[i].type === 'attribute') {
              // By default set name to whatever the lexer returned
              let name = lexed[i].name;
              // Initialize parameter type
              let type;
              // Test parameter name against expression to check for type
              if (argTypeRegex.test(name)) {
                // Separate parameter type from name
                const matches = argTypeRegex.exec(name);
                // Get name from match
                name = matches[1];
                // Get parameter type from match
                type = matches[2];
              }
              // Create new param object based lexed object
              const param: Param = {
                name,
                val: lexed[i].val,
              };
              // Indicate return type if any was found
              if (type) param.type = type;
              // Push param to parameter list
              tokens.params.push(param);
            }
          }
        }
        // Since parameters are being parsed, the proceeding tags could contain
        // a return type. Upon searching the objects for the `:` character,
        // the proceeding object could contain a valid return type
        const colon = this.findByType(':', lexed);
        if (colon !== null) {
          // The next value could be a return type
          const returnLexed = lexed[colon.index + 1];
          // Guesses if value is a return type by checking if the first
          // character is capitalized
          const classRegex = new RegExp(/^[A-Z][a-zA-Z0-9_]+/);
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
        const cleanExp = new RegExp('^' + this.settings.grammar.identifier);
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

    tokens.params = tokens.params.filter((param) => {
      return param.name !== '{' && param.name !== '}';
    });

    return tokens;
  }

  /**
   * Renders parameter tag template for docblock. This method is
   * being overwritten in order to wrap `{}` around binding types
   *
   * Arguments c, t, p should be assumed to be computed by `renderParamTags()`.
   * These ambiguous argument names simply refer to the spaces between columns.
   *
   * @param   {string}  c     Spaces computed between initial tag and param type
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
    let tag = `@param${c} {${type}}${t}${name}${p}${desc}`;
    if (this.style === 'drupal') {
      tag = `@param${c}{${type}}${c}${name}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  /**
   * This method is modified to add the brackets `{}` required by jsDoc
   *
   * @inheritdoc
   */
  public getReturnTag(type: string, spacing: string, desc: string): string {
    let tag = `@return${this.columns}{${type}}${spacing}${desc}`;
    if (this.style === 'drupal') {
      tag = `@return${this.columns}{${type}}\n${this.settings.separator}  ${desc}`;
    }
    return tag;
  }

  /**
   * This method is modified to add the brackets `{}` required by jsDoc
   *
   * @inheritdoc
   */
  public getVarTag(columns: string, type: string): string {
    return `@var${columns}{${type}}`;
  }
}
