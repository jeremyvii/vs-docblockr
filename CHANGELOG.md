## 1.3.0 - June 7, 2021
- Add basic C++ support.

## 1.2.0 - June 7, 2021
- Switched the docblock renderer to use VS Code's `SnippetString` object.

## 1.1.5 - March 2, 2021
- Fix a [bug](https://github.com/jeremyvii/vs-docblockr/issues/77) where PHP parameters with default values as null were render nameless items.

## 1.1.4 - August 16, 2020
- Fix a [bug](https://github.com/jeremyvii/vs-docblockr/issues/74) where JavaScript methods were not parsed properly

## 1.1.3 - July 11, 2020
- Fix a [bug](https://github.com/jeremyvii/vs-docblockr/issues/78) where PHP functions didn't properly parse

## 1.1.2 - May 20, 2020
- Fix a [bug](https://github.com/jeremyvii/vs-docblockr/issues/72) where selections didn't indent properly

## 1.1.1 - May 11, 2020
- Fix a [bug](https://github.com/jeremyvii/vs-docblockr/issues/66) where autocompletion wasn't indenting properly

## 1.1.0 - May 9, 2020
- Add command, `vs-docblockr.renderFromSelection`, for creating docblock snippets from selections
- Fix grammar in bug report template

## 1.0.2 - May 8, 2020
- Fix [bug](https://github.com/jeremyvii/vs-docblockr/issues/60) where duplicate `/**` characters were being rendered

## 1.0.1 - May 1, 2020
- Fix [bug](https://github.com/jeremyvii/vs-docblockr/issues/60) where PHP wouldn't parse mutliple parameters with mixed type usage

## 1.0.0 - May 1, 2020
- Removes old parsing technique in favor of using [Acorn](https://github.com/acornjs/acorn) for tokenization
- Adds a `Symbols` class for tokens with helper methods
- Adds a `Grammar` class for language configuration for helper methods
- Cleans up rendering methods
- Improves code coverage and unit tests
- Parses PHP traits
- Parses JavaScript arrow functions

## 0.8.0 - March 27, 2020
- Properly parse PHP constants
- Add code coverage to tests with Coveralls and Istanbul
- Add additional unit tests

## 0.7.1 - March 21, 2020
- Properly parse destructed objects as parameters
- Conform tests to `tslint`
- Remove JavaScript parser in favor of the TypeScript parser
- Remove unused interface

## 0.7.0 - October 26, 2019
- Implements the C programming language
- Create `Tokens` class to reduce code
- Conform unit tests to tslint style guide

## 0.6.0 - October 25, 2019
- Add TypeScript for Vue.js

## 0.5.8 - October 9, 2019
- Fix issue #40 by checking for trailing `{` in lexer
- Update tests to use `vscode-test`

## 0.5.6 - March 19, 2019
- Fix issue #35 by fixing regex quantifier
- Force drupal coding style to have one space between sections

## 0.5.5 - March 19, 2019
- Fix issue #33 by allowing arguments with typed arrays
- Simple TypeScript regular expressions to use `\w` selector where applicable

## 0.5.4 - March 19, 2019
- Fix issue #31 by allowing expression to be assigned to object properties in JavaScript and TypeScript

## 0.5.3 - March 9, 2019
- Update README.md to reflect `scss` support
- Update package.json to include extension license

## 0.5.2 - March 9, 2019
- Always auto-complete `*` in docblocks in supported languages

## 0.5.0 - March 7, 2019
- Allow drupal style block comments via settings

## 0.4.13 - March 6, 2019
- Fix issue #25 by allowing language identifier characters

## 0.4.12 - March 6, 2019
- Add support for `scss` functions

## 0.4.11 - February 7, 2019
- Fix `npm` package vulnerability

## 0.4.10 - February 7, 2019
- Fix `npm` package vulnerability

## 0.4.8 - January 22, 2019
- Fix issue #22 whereas the TypeScript parser would mistake the function parameter types as parameters

## 0.4.7 - January 10, 2019
- Update README: Add missing configuration to settings table, and update usage gif to have return description
- Update Travis CI badge due to migration from service to integration

## 0.4.6 - January 10, 2019
- Fix issue #17 regarding malformed extension settings
- Fix issue regarding failure to parse functions without parameters

## 0.4.5 - January 9, 2019
- Re-publish missing code from previous patch

## 0.4.4 - January 9, 2019
- Fix issue #15 regarding PHP failing to parse functions with arguments passed by reference

## 0.4.3 - January 7, 2019
- Fix issue #13 regarding PHP failing to parse class names as function return types
- Fix various edge case alignment issues with generated docblocks

## 0.4.2 - November 20, 2018
- Fix issue #11 regarding parsing PHP functions on newlines

## 0.4.1 - November 20, 2018
- Output return type descriptions in function docblocks

## 0.4.0 - September 24, 2018
- Add Java programming language
- Add optional variable type property to token objects

## 0.3.1 - September 17, 2018
- Remove unneeded eslint configuration

## 0.3.0 - September 15, 2018
- Add code style tests for whole `src` directory with [TSLint](https://palantir.github.io/tslint/)
- Conform code base to new code style tests
- Prevent `Parser.renderBlock` from outputting trailing whitespace

## 0.1.9 - August 30, 2018
- Fix node package vulnerabilities

## 0.1.8 - August 30, 2018
- Remove unused variables
- Fix comment spelling

## 0.1.7 - August 2, 2018
- Allow nullable types in PHP (see issue #6)

## 0.1.6 - July 25, 2018
- Add issue templates, contributing guide, and code of conduct

## 0.1.5 - July 25, 2018
- Allow <> to account for array return types in JavaScript (see issue #4)
- Add build status badge

## 0.1.4 - July 19, 2018
- Allow underscores to account for PHP constructors

## 0.1.3 - July 18, 2018
- Code base cleanup
- Use const for variables when they aren't being redefined

## 0.1.2 - July 16, 2018
- Fix alignment issues in docblock output

## 0.1.1 - July 15, 2018
- Minor performance improvements through removal of unused inputs

## 0.1.0 - July 15, 2018
- Update repo assets
- Clarify naming across repo

## 0.0.1 - July 15, 2018
- Initial release
