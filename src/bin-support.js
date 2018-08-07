'use strict';

function runTransform(binRoot, transformName, args) {
  const globby = require('globby');
  const execa = require('execa');
  const chalk = require('chalk');
  const path = require('path');
  const yargs = require('yargs');

  let parsedArgs = yargs.parse(args);
  let paths = parsedArgs._;
  let options = Object.keys(parsedArgs).reduce((acc, key) => {
    if (!['_', '$0', 'help', 'version'].includes(key)) {
      return acc.concat([`--${key}`, `${parsedArgs[key]}`]);
    }
    return acc;
  }, []);

  return globby(paths)
    .then(paths => {
      let transformPath = path.join(binRoot, '..', 'transforms', transformName, 'index.js');

      return execa(
        'jscodeshift',
        ['-t', transformPath, '--extensions', 'js,ts', ...paths, ...options],
        {
          stdio: 'inherit',
        }
      );
    })
    .catch(error => {
      console.error(chalk.red(error.stack)); // eslint-disable-line no-console
      process.exitCode = 1;

      throw error;
    });
}

module.exports = {
  runTransform,
};
