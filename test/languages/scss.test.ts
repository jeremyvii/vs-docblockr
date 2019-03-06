/**
 * Tests specific to parsing the PHP language
 */

import * as assert    from 'assert';
import { Scss }        from '../../src/languages/scss';

// Get parser instance
let parser = new Scss();

suite('SCSS', function () {
  suite('tokenize', function () {
    test('should parse function', function () {
      let token = parser.tokenize('@function foo() {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, '@function');
      assert.equal(token.params.length, 0);
      assert.equal(token.return.present, true);
    });

    test('should parse function with arguments', function () {
      let token = parser.tokenize('@function foo($arg1, $arg2) {');
      assert.equal(token.name, 'foo');
      assert.equal(token.type, '@function');
      assert.equal(token.params.length, 2);
      for (let i in token.params) {
        assert.equal(token.params[i].name, `$arg${parseInt(i) + 1}`);
        assert.equal(token.params[i].val, '');
        assert.equal(token.params[i].type, undefined);
      }
      assert.equal(token.return.present, true);
    });
  });
});
