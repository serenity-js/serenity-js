import path from 'node:path';

import { registerRunner } from '@integration/cucumber-specs';

const pathToCucumberExecutable = path.resolve(
    require.resolve('cucumber/package.json'),
    '..',
    'bin',
    'cucumber.js',
);

const cwd = path.resolve(__dirname, '../');

registerRunner(pathToCucumberExecutable, cwd, [
    '--compiler', 'ts:tsx/cjs',
    '--require', '@serenity-js/cucumber',
    '--require', require.resolve('./support/configure_serenity'),
]);
