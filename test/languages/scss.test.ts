/**
 * Tests specific to parsing the PHP language
 */

import * as assert from 'assert';
import { Scss } from '../../src/languages/scss';

// Get parser instance
const parser = new Scss();

suite('SCSS', () => {
  suite('tokenize', () => {
    test('should parse function', () => {
      const token = parser.tokenize('@function foo() {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, '@function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', () => {
      const token = parser.tokenize('@function foo($arg1, $arg2) {');

      assert.equal(token.name, 'foo');
      assert.equal(token.type, '@function');
      assert.equal(token.params.length, 2);
      for (const i in token.params) {
        if (token.params[i]) {
          assert.equal(token.params[i].name, `$arg${parseInt(i) + 1}`);
          assert.equal(token.params[i].val, '');
          assert.equal(token.params[i].type, undefined);
        }
      }
      assert.equal(token.return.present, true);
    });
  });
});
