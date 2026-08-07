import path from 'node:path';

import { spawner, SpawnResult } from '@integration/testing-tools';

const playwrightExecutable = path.resolve(
    require.resolve('@playwright/test/package.json'),
    '..',
    'cli.js',
);

export function playwrightTestWithHtmlReporter(...params: string[]): Promise<SpawnResult> {

    // Strip CI env vars that would be detected by TestRunArchiver.detectTestRunId().
    // These tests verify directory-per-run behaviour which relies on unique timestamps,
    // not on a shared CI build number.
    const env = { ...process.env };
    delete env.GITHUB_RUN_NUMBER;
    delete env.GITHUB_RUN_ATTEMPT;
    delete env.CI_PIPELINE_IID;
    delete env.BUILD_NUMBER;
    delete env.CIRCLE_BUILD_NUM;

    return spawner(
        playwrightExecutable,
        { cwd: path.resolve(__dirname, '..'), env },
    )(
        'test',
        `--config=${ path.resolve(__dirname, '../playwright-html-reporter.config.ts') }`,
        ...params,
    );
}
