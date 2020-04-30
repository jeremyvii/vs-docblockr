import * as assert from 'assert';

import { TypeScript } from '../src/languages/typescript';

// Get parser instance
const parser = new TypeScript();

suite('Grammar', () => {
  suite('is', () => {
    test('should throw error', () => {
      assert.throws(parser.grammar.is, Error);
    });
  });
});
