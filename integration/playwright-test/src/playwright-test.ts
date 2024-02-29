import { spawner, SpawnResult } from '@integration/testing-tools';
import * as path from 'path';

const playwrightExecutable = path.resolve(
    require.resolve('@playwright/test/package.json'),
    '..',
    'cli.js',
);

export function playwrightTest(...params: string[]): Promise<SpawnResult> {

    /* eslint-disable unicorn/consistent-function-scoping */
    const isReporter = (parameter: string) => parameter.startsWith('--reporter=');
    const reporterNameAndOutputPathFrom = (parameter: string): [ string, string ] => {
        return parameter.split('=')[1].split(':') as [ string, string ];
    }
    /* eslint-enable unicorn/consistent-function-scoping */

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

    const envModifier = params.find(parameter => parameter.startsWith('export '));
    if (envModifier){
        try{
            const [envKey, envValue] = envModifier.replace('export ', '').split('=');
            env[envKey] = envValue;
        }
        catch{
            throw new Error('Invalid env variable modifier. Use "export KEY=VALUE" format');
        }
    }

    return spawner(
        playwrightExecutable,
        { cwd: path.resolve(__dirname, '..'), env },
    )(
        'test',
        `--config=${ path.resolve(__dirname, '../playwright.config.ts') }`,

        ...parameters,
    );
}
