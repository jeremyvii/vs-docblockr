const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([{
  extensionDevelopmentPath: './',
  files: 'out/test/**/*.js',
  mocha: {
    timeout: 5000,
  },
}]);
