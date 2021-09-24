import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

const protractorExecutable = path.resolve(
    require.resolve('protractor/package.json'),
    '..',
    'bin',
    'protractor',
);

const protractorSpawner = spawner(
    protractorExecutable,
    { cwd: path.resolve(__dirname, '..') },
);

export function protractor(...params: string[]): Promise<SpawnResult> {
    return protractorSpawner(
        ...params,
    );
}
