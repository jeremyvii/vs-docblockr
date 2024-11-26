import * as path from 'path';

import { runTests } from '@vscode/test-electron';

/**
 * Run tests.
 */
async function main() {
  try {
    await runTests({
      extensionDevelopmentPath: path.resolve(__dirname, '../'),
      extensionTestsPath: path.resolve(__dirname, './index'),
    });
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.error(err);
    // tslint:disable-next-line: no-console
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
