import { IndentAction, OnEnterRule } from 'vscode';

/**
 * Defines on enter rules for auto completed `*` character in docblocks. This
 * is not support by vscode in all languages
 */
export class Rules {
  /**
   * Enter rules for `/**`
   */
  public static readonly enterRules: OnEnterRule[] = [
    {
      action: {
        appendText: ' * ',
        indentAction: IndentAction.None,
      },
      afterText: /^\s*\*\/$/,
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*/gm,
    },
    {
      action: {
        appendText: ' * ',
        indentAction: IndentAction.None,
      },
      beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
    },
    {
      action: {
        appendText: ' * ',
        indentAction: IndentAction.Outdent,
      },
      beforeText: /^(\t|(\s))*\s\*(\s([^\*]|\*(?!\/))*)?$/,
    },
  ];
}
