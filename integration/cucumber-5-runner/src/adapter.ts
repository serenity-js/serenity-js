import { CucumberCLIAdapter, CucumberConfig, TempFileOutput } from '@serenity-js/cucumber/lib/cli';
import { FileSystem, ModuleLoader, Path } from '@serenity-js/core/lib/io';
import * as path from 'path';

export = function (cucumberConfig: CucumberConfig, pathToScenario: Path) {
    const runnerRootDir = path.resolve(__dirname, '..');

    const adapter = new CucumberCLIAdapter({
            ...cucumberConfig,
            require: [
                path.join(runnerRootDir, 'lib/step_definitions/synchronous.steps.js'),
                path.join(runnerRootDir, 'lib/support/configure_serenity.js'),
            ]
        },
        new ModuleLoader(runnerRootDir),
        new TempFileOutput(new FileSystem(Path.from(runnerRootDir))),
    );

    return adapter.run([ pathToScenario.value ]);
}
