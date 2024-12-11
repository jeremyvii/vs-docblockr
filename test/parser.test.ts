import * as assert from 'assert';

import { TypeScript } from '../src/languages/typescript';

import config from './defaultConfiguration';

// Use the JavaScript parser for the sake of setup
const parser = new TypeScript('typescript');

parser.style = config.style;
parser.columnCount = config.columnSpacing;

suite('Parser', () => {
  suite('generateSpacing', () => {
    test('should always have a length that is zero or greater', () => {
      const spacing = parser.generateSpacing(-1);

      assert.strictEqual(spacing.length, 0);
    });
  });

  suite('renderBlock', () => {
    test('should return empty docblock when using un-parsable code', () => {
      const token = parser.getSymbols('hello');
      const block = parser.renderBlock(token).value;

      const expected = [
        '/**',
        ' * ${1:[description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(block, expected);
    });

    test('should return docblock without trailing whitespace', () => {
      const token = parser.getSymbols('function foo(bar) {');
      const block = parser.renderBlock(token).value;

      assert.strictEqual(/\s$/gm.test(block), false, 'No trailing whitespace');
    });

    test('should render return tag based on defaultReturnTag configuration', () => {
      parser.defaultReturnTag = false;

      const withoutReturn = parser.getSymbols('function foo(bar) {');
      let result = parser.renderBlock(withoutReturn).value;

      let expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   {${2:[type]}\\}  bar  ${3:[bar description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected, 'Failed with defaultReturnTag disabled');

      parser.defaultReturnTag = true;

      const withReturn = parser.getSymbols('function foo(bar): boolean {');
      result = parser.renderBlock(withReturn).value;

      expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   {${2:[type]}\\}  bar  ${3:[bar description]}',
        ' *',
        ' * @return  {${4:boolean}\\}      ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected, 'Failed with defaultReturnTag enabled');
    });

    test('should successfully use default comment style', () => {
      parser.defaultReturnTag = true;
      parser.style = 'default';
      parser.columnCount = config.columnSpacing;

      const token = parser.getSymbols('function foo(bar) {');
      const result = parser.renderBlock(token).value;

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param   {${2:[type]}\\}  bar  ${3:[bar description]}',
        ' *',
        ' * @return  {${4:[type]}\\}       ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should use drupal comment style when configured', () => {
      parser.defaultReturnTag = true;
      parser.style = 'drupal';
      parser.columnCount = 1;

      const token = parser.getSymbols('function foo(bar) {');
      const result = parser.renderBlock(token).value;

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param {${2:[type]}\\} bar',
        ' *   ${3:[bar description]}',
        ' *',
        ' * @return {${4:[type]}\\}',
        ' *   ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should render without newlines between tags when newLinesBetweenTags is false', () => {
      parser.defaultReturnTag = true;
      parser.newLinesBetweenTags = false;
      parser.style = 'default';
      parser.columnCount = config.columnSpacing;

      let token = parser.getSymbols('function foo(bar) {');
      let result = parser.renderBlock(token).value;

      let expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' * @param   {${2:[type]}\\}  bar  ${3:[bar description]}',
        ' * @return  {${4:[type]}\\}       ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);

      token = parser.getSymbols('public foo: string;');
      result = parser.renderBlock(token).value;

      expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' * @var {${2:[type]}\\}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });

    test('should render without auto indention around tags when alignTags is false', () => {
      parser.alignTags = false;
      parser.defaultReturnTag = true;
      parser.newLinesBetweenTags = true;
      parser.style = 'default';
      parser.columnCount = config.columnSpacing;

      const token = parser.getSymbols('function foo(bar) {');
      const result = parser.renderBlock(token).value;

      const expected = [
        '/**',
        ' * ${1:[foo description]}',
        ' *',
        ' * @param {${2:[type]}\\} bar ${3:[bar description]}',
        ' *',
        ' * @return {${4:[type]}\\} ${5:[return description]}',
        ' */',
      ].join('\n');

      assert.strictEqual(result, expected);
    });
  });
});
