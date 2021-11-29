import { registerRunner } from '@integration/cucumber-specs';
import * as path from 'path'; // eslint-disable-line unicorn/import-style

const pathToCucumberExecutable = path.resolve(
    require.resolve('cucumber/package.json'),
    '..',
    'bin',
    'cucumber.js',
);

const cwd = path.resolve(__dirname, '../');

registerRunner(pathToCucumberExecutable, cwd, [
    '--compiler', 'ts:ts-node/register',
    '--require', 'node_modules/@serenity-js/cucumber/lib/index.js',
    '--require', require.resolve('./support/configure_serenity'),
]);
