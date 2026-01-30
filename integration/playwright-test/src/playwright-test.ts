import path from 'node:path';

import { spawner, SpawnResult } from '@integration/testing-tools';

const playwrightExecutable = path.resolve(
    require.resolve('@playwright/test/package.json'),
    '..',
    'cli.js',
);

export function playwrightTest(...params: string[]): Promise<SpawnResult> {

    const isReporter = (parameter: string) => parameter.startsWith('--reporter=');
    const reporterNameAndOutputPathFrom = (parameter: string): [ string, string ] => {
        return parameter.split('=')[1].split(':') as [ string, string ];
    }

    const [ reporters, parameters ] = params.reduce(
        ([ reporters, parameters ], parameter: string) => {
            return isReporter(parameter)
                ? [ [... reporters, reporterNameAndOutputPathFrom(parameter) ], parameters ]
                : [ reporters, [... parameters, parameter] ]
        },
        [[], []]
    );

    const env = Object.fromEntries(
        reporters.map(([name, outputPath]) => [ `REPORTER_${ name.toUpperCase() }`, outputPath ])
    );

    return spawner(
        playwrightExecutable,
        { cwd: path.resolve(__dirname, '..'), env },
    )(
        'test',
        `--config=${ path.resolve(__dirname, '../playwright.config.ts') }`,

        ...parameters,
    );
}
