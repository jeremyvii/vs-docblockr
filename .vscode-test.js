const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig([{
  extensionDevelopmentPath: './',
  files: 'out/test/**/*.js',
}]);