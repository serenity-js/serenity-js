import { FileSystem, ModuleLoader, Path } from '@serenity-js/core/lib/io';
import { CucumberCLIAdapter, CucumberConfig, TempFileOutput } from '@serenity-js/cucumber/lib/cli';
import path from 'path';

export = function (cucumberConfig: CucumberConfig, pathToScenario: Path): Promise<void> {
    const runnerRootDirectory = path.resolve(__dirname, '..');

    const adapter = new CucumberCLIAdapter({
        ...cucumberConfig,
        require: [
            path.join(runnerRootDirectory, 'lib/step_definitions/synchronous.steps.js'),
            path.join(runnerRootDirectory, 'lib/support/configure_serenity.js'),
        ]
    },
    new ModuleLoader(runnerRootDirectory),
    new TempFileOutput(new FileSystem(Path.from(runnerRootDirectory))),
    );

    return adapter.run([ pathToScenario.value ]);
}
