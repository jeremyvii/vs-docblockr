import * as glob from 'glob';
import * as Mocha from 'mocha';
import * as path from 'path';

/**
 * Runs tests and generates code coverage report
 */
export async function run(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const NYC = require('nyc');

  const nyc = new NYC({
    all: true,
    cwd: path.resolve(__dirname, '..', '..'),
    exclude: [
      'src/snippets.ts',
      '**/test/**',
      '.vscode-test/**',
    ],
    hookRequire: true,
    hookRunInContext: true,
    hookRunInThisContext: true,
    reporter: ['lcov'],
  });

  nyc.createTempDirectory();
  nyc.wrap();

  // Create the mocha test
  const mocha = new Mocha({
    color: true,
    timeout: '50s',
    ui: 'tdd',
  });

  const testsRoot = path.resolve(__dirname, '..');

  try {
    await new Promise<void>((resolve, reject) => {
      glob('**/**.test.js', { cwd: testsRoot }, (error, files) => {
        if (error) {
          return reject(error);
        }

        files.forEach((file) => {
          return mocha.addFile(path.resolve(testsRoot, file));
        });

        mocha.run((failures: number) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      });
    });
  } finally {
    if (nyc) {
      await nyc.writeCoverageFile();
      await nyc.report();
    }
  }
}
