import { IndentAction, OnEnterRule } from 'vscode';

export class Rules {
  static readonly enterRules: OnEnterRule[] = [
    {
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
      afterText: /^\s*\*\/$/,
      action: {
        indentAction: IndentAction.IndentOutdent,
        appendText: ' * ',
      }
    }
  ]
}