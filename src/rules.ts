import { IndentAction, OnEnterRule } from 'vscode';

/**
 * Defines on enter rules for auto completed `*` character in docblocks. This
 * is not support by vscode in all languages
 */
export class Rules {
  static readonly enterRules: OnEnterRule[] = [
    {
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*/gm,
      afterText: /^\s*\*\/$/,
      action: {
        indentAction: IndentAction.None,
        appendText: ' * ',
      }
    }, {
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      action: {
        indentAction: IndentAction.None,
        appendText: ' * '
      }
    }, {
      beforeText: /^(\t|(\s))*\s\*(\s([^\*]|\*(?!\/))*)?$/,
      action: {
        indentAction: IndentAction.Outdent,
        appendText: ' * '
      }
    }
  ]
}
