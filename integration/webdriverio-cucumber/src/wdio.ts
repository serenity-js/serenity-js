import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

const wdioExecutable = path.resolve(
    require.resolve('@wdio/cli'),
    '../..',
    'bin',
    'wdio',
);

const wdioSpawner = spawner(
    wdioExecutable,
    { cwd: path.resolve(__dirname, '..') },
);

export function wdio(...params: string[]): Promise<SpawnResult> {
    return wdioSpawner(
        ...params,
    );
}
