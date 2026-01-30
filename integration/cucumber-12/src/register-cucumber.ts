import path from 'node:path';

import { registerRunner } from '@integration/cucumber-specs';

const pathToCucumberExecutable = path.resolve(
    require.resolve('@cucumber/cucumber/package.json'),
    '..',
    'bin',
    'cucumber-js',
);

const cwd = path.resolve(__dirname, '../');

registerRunner(pathToCucumberExecutable, cwd, [
    '--require-module', 'ts-node/register',
    '--format', '@serenity-js/cucumber',
    '--format-options', `{ "specDirectory": "${ path.resolve(__dirname, '../../cucumber-specs/features') }" }`,
    '--require', require.resolve('./support/configure_serenity'),
]);
