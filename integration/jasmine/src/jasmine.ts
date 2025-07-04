import path from 'node:path';

import { spawner, SpawnResult } from '@integration/testing-tools';

const jasmineExecutable = path.resolve(
    require.resolve('jasmine'), // resolves to jasmine/lib/jasmine.js
    '..',
    '..',
    'bin',
    'jasmine.js',
);

export const jasmineSpawner = spawner(
    jasmineExecutable,
    { cwd: path.resolve(__dirname, '..') },
);

/**
 * @see https://jasmine.github.io/setup/nodejs.html
 * @param {string[]} params
 */
export function jasmine(...params: string[]): Promise<SpawnResult> {
    return jasmineSpawner(
        ...params,
        '--random=false',
        '--reporter=@serenity-js/jasmine',
        `--require=${ path.resolve(__dirname, '../examples/setup.js') }`,
    );
}
