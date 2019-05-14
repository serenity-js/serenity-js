import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

const jasmineExecutable = path.resolve(
    require.resolve('jasmine/package.json'),
    '..',
    'bin',
    'jasmine.js',
);

const jasmineSpawner = spawner(
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

        // The path to the reporter needs to be relative to the Jasmine module.
        // Normally this will be simply "@serenity-js/jasmine" as the Serenity/JS adapter for Jasmine
        // will be installed next to it.
        '--reporter=../../../packages/jasmine',

        // Same goes for the setup.js, which registers a ChildProcessReporter to enable integration testing
        '--require=../../../integration/jasmine/examples/setup.js',
    );
}
