import { IndentAction, OnEnterRule } from 'vscode';

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
