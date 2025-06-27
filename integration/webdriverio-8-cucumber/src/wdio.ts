import * as path from 'node:path';

import { spawner, SpawnResult } from '@integration/testing-tools';

const wdioExecutable = path.resolve(
    require.resolve('@wdio/cli/package.json'),
    '..',
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
