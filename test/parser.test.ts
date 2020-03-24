import * as assert from 'assert';
import { TypeScript } from '../src/languages/typescript';
import config from './defaultConfiguration';

// Use the JavaScript parser for the sake of setup
const parser = new TypeScript();

const createSpacing = (length = config.columnSpacing) => Array(length + 1).join(' ');

parser.style = config.style;
parser.columns = createSpacing();

suite('Parser', () => {
  suite('renderBlock', () => {
    test('should return docblock without trailing whitespace', () => {
      const token = parser.tokenize('function foo(bar) {');
      const block = parser.renderBlock(token);

      assert.equal(/\s$/gm.test(block), false, 'No trailing whitespace');
    });

    test('should successfully use default comment style', () => {
      const token = parser.tokenize('function foo(bar) {');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   {${2:[type]}} bar ${3:[bar description]}',
        ' *',
        ' * @return  {${4:[type]}}     ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.equal(result, expected);
    });

    test('should use drupal comment style when configured', () => {
      parser.style = 'drupal';
      parser.columns = createSpacing(1);

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
