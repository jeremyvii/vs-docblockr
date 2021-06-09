# VS DocBlockr (Visual Studio Code)

[![Actions Status](https://img.shields.io/github/workflow/status/jeremyvii/vs-docblockr/Tests.svg?logo=github)](https://github.com/jeremyvii/vs-docblockr/actions)
[![Coverage Status](https://coveralls.io/repos/github/jeremyvii/vs-docblockr/badge.svg?branch=main)](https://coveralls.io/github/jeremyvii/vs-docblockr?branch=main)
[![GitHub release](https://img.shields.io/github/release/jeremyvii/vs-docblockr.svg)](https://github.com/jeremyvii/vs-docblockr/releases/latest)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/jeremyljackson.vs-docblock)](https://marketplace.visualstudio.com/items?itemName=jeremyljackson.vs-docblock)

A Visual Studio Code port of the Atom package [Docblockr](https://github.com/nikhilkalige/docblockr).

[Extension page](https://marketplace.visualstudio.com/items?itemName=jeremyljackson.vs-docblock)

Currently three languages have been implemented:

* C
* Java
* JavaScript
* PHP
* SCSS
* TypeScript
* Vue.js

More languages will be implemented in the future.

## Usage

Type `/**` above the code you want to apply a docblock too, and press `enter`.

![Demonstration of extension](assets/demo.gif)

The `Render from selection` command is also available in the command palette.

![Demonstration of extension](assets/command-demo.gif)

This command can also be used to parse code that spans multiple lines. (Note:
you autocomplete multiple lines with the `/**` keybinding)

![Demonstration of extension](assets/command-demo-2.gif)

## Settings

Currently the following configuration settings have been implemented:

| Title                    | Description                                                                     |
|--------------------------|---------------------------------------------------------------------------------|
| Align Tags               | Whether or not to automatically align the parameters, return, or variable tags. |
| Block Comment Style      | Which doc block comment style to use (`default\|drupal`).                       |
| Column Spacing           | Minimum number of spaces between columns.                                       |
| New Lines Between Tags   | Whether or not to add new lines between tags.                                   |
| Default return tag       | Whether or not to display a return tag.                                         |
| \*SCSS Comment Close     | Type of block level comment closing to use.                                     |
| \*SCSS Comment Open      | Type of block level comment opening to use.                                     |
| \*SCSS Comment Separator | Type of block level separator closing to use.                                   |

\* *Note: VS DocBlockr does not currently support autocompletion of SASS blocks with `///`.*
