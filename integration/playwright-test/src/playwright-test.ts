import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

const playwrightExecutable = path.resolve(
    require.resolve('@playwright/test/package.json'),
    '..',
    'cli.js',
);

const playwrightSpawner = spawner(
    playwrightExecutable,
    { cwd: path.resolve(__dirname, '..') },
);

export function playwrightTest(...params: string[]): Promise<SpawnResult> {
    return playwrightSpawner(
        'test',
        `--config=${ path.resolve(__dirname, '../playwright.config.ts') }`,

        ...params,
    );
}
