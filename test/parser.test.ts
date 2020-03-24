import * as assert from 'assert';
import { TypeScript } from '../src/languages/typescript';
import { Tokens } from '../src/tokens';

// Use the JavaScript parser for the sake of setup
const parser = new TypeScript();

suite('Parser', () => {
  suite('renderBlock', () => {
    test('should return docblock without trailing whitespace', () => {
      const token: Tokens = {
        name: 'foo',
        params: [{
          name: 'bar',
          type: 'boolean',
          val: '',
        }],
        return: {
          present: true,
          type: 'boolean',
        },
        type: 'function',
      };

      const block = parser.renderBlock(token);
      assert.equal(/\s$/gm.test(block), false, 'No trailing whitespace');
    });

    test('should use drupal comment style when configured', () => {
      parser.style = 'drupal';
      parser.columns = Array(2).join(' ');

      const token = parser.tokenize('function foo(bar) {');

      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param {${2:[type]}} bar',
        ' *   ${3:[bar description]}',
        ' *',
        ' * @return {${4:[type]}}',
        ' *   ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.equal(result, expected);
    });
  });
});
