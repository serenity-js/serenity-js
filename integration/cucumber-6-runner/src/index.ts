import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

const cucumberExecutable = path.resolve(
    require.resolve('cucumber/package.json'),
    '..',
    'bin',
    'cucumber-js',
);

const cucumberSpawner = spawner(
    cucumberExecutable,
    { cwd: path.resolve(__dirname, '..') },
);

export = (...params: string[]): Promise<SpawnResult> => cucumberSpawner(
    ...params,
);
