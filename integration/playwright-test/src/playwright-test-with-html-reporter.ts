import path from 'node:path';

import { spawner, SpawnResult } from '@integration/testing-tools';

const playwrightExecutable = path.resolve(
    require.resolve('@playwright/test/package.json'),
    '..',
    'cli.js',
);

export function playwrightTestWithHtmlReporter(...params: string[]): Promise<SpawnResult> {
    return spawner(
        playwrightExecutable,
        { cwd: path.resolve(__dirname, '..'), env: process.env },
    )(
        'test',
        `--config=${ path.resolve(__dirname, '../playwright-html-reporter.config.ts') }`,
        ...params,
    );
}
