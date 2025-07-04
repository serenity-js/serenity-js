import path from 'node:path'; // eslint-disable-line unicorn/import-style

import { registerRunner } from '@integration/cucumber-specs';

const pathToCucumberExecutable = path.resolve(
    require.resolve('cucumber/package.json'),
    '..',
    'bin',
    'cucumber.js',
);

const cwd = path.resolve(__dirname, '../');

registerRunner(pathToCucumberExecutable, cwd, [
    '--compiler', 'ts:ts-node/register',
    '--format', 'node_modules/@serenity-js/cucumber',
    '--require', require.resolve('./support/configure_serenity'),
]);
