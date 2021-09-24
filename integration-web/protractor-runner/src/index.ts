import * as path from 'path';

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

process.argv = [].concat(
    process.argv.slice(0, 2),
    path.resolve(__dirname, 'protractor.conf.js'),
    process.argv.slice(2)
);

require('protractor/built/cli.js');
