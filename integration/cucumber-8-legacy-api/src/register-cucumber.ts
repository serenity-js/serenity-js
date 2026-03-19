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
    '--format', '@serenity-js/cucumber',
    '--format-options', `{ "specDirectory": "${ path.resolve(__dirname, '../../cucumber-specs/features') }" }`,
    '--import', require.resolve('./support/configure_serenity'),
], [
    '--import', 'tsx',
]);
