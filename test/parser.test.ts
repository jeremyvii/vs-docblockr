import * as assert from 'assert';
import { TypeScript } from '../src/languages/typescript';
import config from './defaultConfiguration';

// Use the JavaScript parser for the sake of setup
const parser = new TypeScript();

parser.style = config.style;
parser.columnCount = config.columnSpacing;

suite('Parser', () => {
  suite('renderBlock', () => {
    test('should return docblock without trailing whitespace', () => {
      const token = parser.tokenize('function foo(bar) {');
      const block = parser.renderBlock(token);

      assert.equal(/\s$/gm.test(block), false, 'No trailing whitespace');
    });

    test('should render return tag based on defaultReturnTag configuration', () => {
      parser.defaultReturnTag = false;

      const withoutReturn = parser.tokenize('function foo(bar) {');
      let result = parser.renderBlock(withoutReturn);

      let expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param  {${2:[type]}}  bar  ${3:[bar description]}',
        ' */',
      ].join('\n');

      assert.equal(result, expected, 'Failed with defaultReturnTag disabled');

      parser.defaultReturnTag = true;

      const withReturn = parser.tokenize('function foo(bar): boolean {');
      result = parser.renderBlock(withReturn);

      expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param  {${2:[type]}}  bar  ${3:[bar description]}',
        ' *',
        ' * @return {${4:boolean}}      ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.equal(result, expected, 'Failed with defaultReturnTag enabled');
    });

    test('should successfully use default comment style', () => {
      const token = parser.tokenize('function foo(bar) {');
      const result = parser.renderBlock(token);

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param  {${2:[type]}}  bar  ${3:[bar description]}',
        ' *',
        ' * @return {${4:[type]}}       ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.equal(result, expected);
    });

    test('should use drupal comment style when configured', () => {
      parser.style = 'drupal';
      parser.columns = parser.generateSpacing(2);

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
