import * as assert from 'assert';

import { TypeScript } from '../src/languages/typescript';

// Get parser instance
const parser = new TypeScript('typescript');

suite('Grammar', () => {
  suite('is', () => {
    test('should throw error if invalid property is provided', () => {
      assert.throws(() => {
        parser.grammar.is('foo', 'junk');
      } , Error);
    });
  });
});
