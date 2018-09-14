import * as assert from 'assert';
import { Tokens } from '../src/parser';
import { JavaScript } from '../src/languages/javascript';

suite('Parser', () => {
  suite('renderBlock', () => {
    test('don\'t return docblock with trailing whitespace', () => {
      // Use the JavaScript parser for the sake of setup
      const parser = new JavaScript();

      const token: Tokens = {
        name: 'foo',
        type: 'function',
        return: {
          present: true,
          type: 'boolean',
        },
        params: [{
          name: 'bar',
          type: 'boolean',
          val: '',
        }],
      };

      const block = parser.renderBlock(token);

      assert.equal(/\s$/.test(block), false, 'No trailing whitespace');
    });
  });
});