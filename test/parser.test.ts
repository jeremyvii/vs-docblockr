import * as assert from 'assert';
import { TypeScript } from '../src/languages/typescript';
import { Tokens } from '../src/tokens';

suite('Parser', () => {
  suite('renderBlock', () => {
    test('don\'t return docblock with trailing whitespace', () => {
      // Use the JavaScript parser for the sake of setup
      const parser = new TypeScript();

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
  });
});
