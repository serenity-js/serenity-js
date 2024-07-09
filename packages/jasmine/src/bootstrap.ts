import { RuntimeError, serenity } from '@serenity-js/core';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io/index.js';

import { monkeyPatched } from './monkeyPatched.js';
import { SerenityReporterForJasmine } from './SerenityReporterForJasmine.js';

/**
 * Monkey-patches Jasmine's Suite and Spec so that they provide more accurate information,
 * and returns a bootstrapped instance of the [`SerenityReporterForJasmine`](https://serenity-js.org/api/jasmine/function/default/) to be registered with Jasmine.
 *
 * ## Registering the reporter from the command line
 *
 * ```terminal
 * jasmine --reporter=@serenity-js/jasmine
 * ```
 *
 * ## Registering the reporter programmatically
 *
 * ```ts
 * import serenityReporterForJasmine = require('@serenity-js/jasmine');
 *
 * jasmine.getEnv().addReporter(serenityReporterForJasmine);
 * ```
 *
 * @param config
 * @param jasmine
 *  the global.jasmine instance
 */
export function bootstrap(config: SerenityReporterForJasmineConfig = {}, jasmine = (global as any).jasmine): SerenityReporterForJasmine {
    const wrappers = {
        expectationResultFactory: originalExpectationResultFactory => ((attributes: { passed: boolean, error: Error }) => {
            const result = originalExpectationResultFactory(attributes);

            if (! attributes.passed && attributes.error instanceof RuntimeError) {
                result.stack = attributes.error.stack;
            }

            return result;
        }),
    };

    jasmine.Suite = monkeyPatched(jasmine.Suite, wrappers);
    jasmine.Spec = monkeyPatched(jasmine.Spec, wrappers);

    const cwd = Path.from(process.cwd());
    const requirementsHierarchy = new RequirementsHierarchy(
        new FileSystem(cwd),
        config?.specDirectory && cwd.resolve(Path.from(config?.specDirectory)),
    );

    return new SerenityReporterForJasmine(serenity, requirementsHierarchy);
}

export interface SerenityReporterForJasmineConfig {
    specDirectory?: string;
}
