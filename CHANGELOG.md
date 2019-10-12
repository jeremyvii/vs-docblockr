## 0.5.8 - October, 9 2019
- Fix issue #40 by checking for trailing `{` in lexer
- Update tests to use `vscode-test`

## 0.5.6 - March, 19 2019
- Fix issue #35 by fixing regex quantifier
- Force drupal coding style to have one space between sections

## 0.5.5 - March, 19 2019
- Fix issue #33 by allowing arguments with typed arrays
- Simple TypeScript regular expressions to use `\w` selector where applicable

## 0.5.4 - March, 19 2019
- Fix issue #31 by allowing expression to be assigned to object properties in JavaScript and TypeScript

## 0.5.3 - March, 9 2019
- Update README.md to reflect `scss` support
- Update package.json to include extension license

## 0.5.2 - March, 9 2019
- Always auto-complete `*` in docblocks in supported languages

## 0.5.0 - March, 7 2019
- Allow drupal style block comments via settings

## 0.4.13 - March, 6 2019
- Fix issue #25 by allowing language identifier characters

## 0.4.12 - March, 6 2019
- Add support for `scss` functions

## 0.4.11 - February, 7 2019
- Fix `npm` package vulnerability

## 0.4.10 - February, 7 2019
- Fix `npm` package vulnerability

## 0.4.8 - January, 22 2019
- Fix issue #22 whereas the TypeScript parser would mistake the function parameter types as parameters

## 0.4.7 - January, 10 2019
- Update README: Add missing configuration to settings table, and update usage gif to have return description
- Update Travis CI badge due to migration from service to integration

## 0.4.6 - January, 10 2019
- Fix issue #17 regarding malformed extension settings
- Fix issue regarding failure to parse functions without parameters

## 0.4.5 - January, 9 2019
- Re-publish missing code from previous patch

## 0.4.4 - January, 9 2019
- Fix issue #15 regarding PHP failing to parse functions with arguments passed by reference

## 0.4.3 - January, 7 2019
- Fix issue #13 regarding PHP failing to parse class names as function return types
- Fix various edge case alignment issues with generated docblocks

## 0.4.2 - November, 20 2018
- Fix issue #11 regarding parsing PHP functions on newlines

## 0.4.1 - November, 20 2018
- Output return type descriptions in function docblocks

## 0.4.0 - September, 24 2018
- Add Java programming language
- Add optional variable type property to token objects

## 0.3.1 - September, 17 2018
- Remove unneeded eslint configuration

## 0.3.0 - September, 15 2018
- Add code style tests for whole `src` directory with [TSLint](https://palantir.github.io/tslint/)
- Conform code base to new code style tests
- Prevent `Parser.renderBlock` from outputting trailing whitespace

## 0.1.9 - August, 30 2018
- Fix node package vulnerabilities

## 0.1.8 - August, 30 2018
- Remove unused variables
- Fix comment spelling

## 0.1.7 - August, 2 2018
- Allow nullable types in PHP (see issue #6)

## 0.1.6 - July, 25 2018
- Add issue templates, contributing guide, and code of conduct

## 0.1.5 - July, 25 2018
- Allow <> to account for array return types in JavaScript (see issue #4)
- Add build status badge

## 0.1.4 - July, 19 2018
- Allow underscores to account for PHP constructors

## 0.1.3 - July, 18 2018
- Code base cleanup
- Use const for variables when they aren't being redefined

## 0.1.2 - July, 16 2018
- Fix alignment issues in docblock output

## 0.1.1 - July, 15 2018
- Minor performance improvements through removal of unused inputs

## 0.1.0 - July, 15 2018
- Update repo assets
- Clarify naming across repo

## 0.0.1 - July, 15 2018
- Initial release
