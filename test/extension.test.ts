/**
 * Tests code in `src` against specified tslint rules
 */

import { Linter, Configuration } from 'tslint';
import { readdirSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import * as assert from 'assert';

interface File {
  name: string,
  path?: string
}

/**
 * Recursively get source code files and their absolute path on the file system
 * 
 * @param   {string}  dir    Absolute path to source code
 * @param   {File[]}  files  List of file names, and paths
 * 
 * @return  {File[]}         List of files and paths
 */
const getFiles = (dir: string, files: File[]): File[] => {
  // Get names of each file in specified folder
  readdirSync(dir).forEach((file) => {
    // Get absolute path to file
    const path = dir + '/' + file;
    // Determine whether to proceed into sub-folders
    if (statSync(path).isDirectory()) {
      // Get files in sub-folders
      files = getFiles(path, files);
    } else {
      // Push file and path to return list
      files.push({
        name: file,
        path: path
      });
    }
  });
  return files;
};

// Absolute path to src code
const src = resolve(`${__dirname}../../../src`);
// Get list of source files and their absolute paths on the file system
const files = getFiles(src, []);
// Resolve to linter configuration
const config = resolve(`${__dirname}/../../tslint.json`);

suite('Code style validation', () => {
  // Test each file resolved in files list. This should only be the source files
  files.forEach(file => {
    test(`validates ${file.name}`, () => {
      // Get new linter instance that does not attempt to fix error-ed code
      const linter = new Linter({ fix: false });
      // Pull file's contents
      const contents = readFileSync(file.path, 'utf8');
      // Get configuration based on current file context
      const configuration = Configuration.findConfiguration(config, file.path).results;
      // Test file against linter
      linter.lint(file.path, contents, configuration);
      const result = linter.getResult();
      // Fail test if linter detects error
      if (result.errorCount) assert.fail(false, true, result.output);
    });
  });
});