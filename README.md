# DocBlockr (Visual Studio Code)

[![Build Status](https://travis-ci.org/jeremyvii/vs-docblockr.svg?branch=master)](https://travis-ci.org/jeremyvii/vs-docblockr)

A Visual Studio Code port of the Atom package [Docblockr](https://github.com/nikhilkalige/docblockr). 

[Extension page](https://marketplace.visualstudio.com/items?itemName=jeremyljackson.vs-docblock)

Currently three languages have been implemented:

* JavaScript
* PHP
* TypeScript

More languages to come in the future.

## Usage 

Type `/**` above the code you want to apply a docblock too, and press `enter`.

![Demonstration of extension](assets/demo.gif)

## Settings

Currently the following configuration settings have been implemented:

| Title               | Description                              |
|---------------------|------------------------------------------|
| Column Spacing      | Minimum number of spaces between columns |
| Default return type | Whether or not to display a return tag   |

## Acknowledgments

The [language agnostic lexing process](src/lexer.ts) is a stripped down version
of the [Pug Lexer](https://github.com/pugjs/pug-lexer).