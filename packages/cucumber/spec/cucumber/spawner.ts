import { spawner } from '@serenity-js/integration-testing';
import { Spawned } from '@serenity-js/integration-testing';

const node_modules = `${__dirname}/../../node_modules`;

const cucumberSpawner = spawner(
    `${node_modules}/.bin/cucumber-js`,
    { cwd: `${__dirname}/../`, silent: true },
);

export const cucumber = (...params: string[]): Spawned => cucumberSpawner(
    '--compiler', 'ts:ts-node/register',
    '--require',  './../src/register.ts',
    '--require',  './cucumber/configure.ts',
    '--require',  'features/step_definitions/steps.ts',
    ...params,
);
