import { spawner, SpawnResult } from '@integration/testing-tools';
import { CucumberConfig } from '@serenity-js/cucumber/lib/cli';
import * as path from 'path';

export function invoke(runnerVersion: string, configuration: CucumberConfig, pathToScenario: string): Promise<SpawnResult> {
    const
        runnerName = `${ runnerVersion }-runner`,
        adapterName = `${ runnerVersion }-adapter`;

    const adapter = path.resolve(
        require.resolve(`@integration/${ runnerName }/package.json`),
        '..',
        'bin',
        adapterName,
    );

    const adapterSpawner = spawner(
        adapter,
        { cwd: path.resolve(__dirname, `../../${ runnerName }`) },
    );

    return adapterSpawner(JSON.stringify(configuration), path.resolve(__dirname, '../', pathToScenario));
}
