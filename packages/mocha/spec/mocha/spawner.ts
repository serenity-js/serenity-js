import { spawner } from '@serenity-js/integration-testing';

const node_modules = `${__dirname}/../../node_modules`;

const tsNodeSpawner = spawner(
    `${node_modules}/.bin/_mocha`,
    { cwd: `${__dirname}/../`, silent: false },
);

export const mocha = (...params) => tsNodeSpawner(
    '--require', 'ts-node/register',
    '--require',  './mocha/configure.ts',
    '--reporter',  `${__dirname}/../../src/index.ts`,
    ...params,
    './examples/*.spec.ts',
);
