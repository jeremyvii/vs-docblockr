# DocBlockr (Visual Studio Code)

A Visual Studio Code port of the Atom package [Docblockr](https://github.com/nikhilkalige/docblockr). 

This is extension is yet to be published to Visual Studio Marketplace, is still in an alpha state. Currently three languages have been implemented:

* JavaScript
* PHP
* TypeScript

As time goes on I plan to implement more.

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