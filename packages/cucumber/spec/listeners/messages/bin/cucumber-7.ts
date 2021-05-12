import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';   // eslint-disable-line unicorn/import-style

const cucumberExecutable = path.resolve(
    require.resolve('@cucumber/cucumber/package.json'),
    '..',
    'bin',
    'cucumber-js',
);

const cucumber = spawner(
    cucumberExecutable,
    { cwd: path.resolve(__dirname, '..') },
);

export const cucumber7 = (...params: string[]): Promise<SpawnResult> => cucumber(
    // '--require-module', 'ts-node/register',
    ...params,
    '--publish-quiet',
);
