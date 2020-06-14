import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

const mochaExecutable = path.resolve(
    require.resolve('mocha/package.json'),
    '..',
    'bin',
    '_mocha',
);

const mochaSpawner = spawner(
    mochaExecutable,
    { cwd: path.resolve(__dirname, '..') },
);

/**
 * @see https://jasmine.github.io/setup/nodejs.html
 * @param {string[]} params
 */
export function mocha(...params: string[]): Promise<SpawnResult> {
    return mochaSpawner(

        ...params,

        // The path to the reporter needs to be relative to the Mocha module.
        // Normally this will be simply "@serenity-js/mocha" as the Serenity/JS adapter for Jasmine
        // will be installed next to it.
        `--reporter=${ path.resolve(__dirname, '../../../packages/mocha') }`,

        // Same goes for the setup.js, which registers a ChildProcessReporter to enable integration testing
        `--require=${ path.resolve(__dirname, '../../../integration/mocha/examples/setup.js') }`,
    );
}
