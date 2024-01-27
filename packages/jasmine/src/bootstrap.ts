import { RuntimeError, serenity } from '@serenity-js/core';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io/index.js';

import { monkeyPatched } from './monkeyPatched.js';
import { SerenityReporterForJasmine } from './SerenityReporterForJasmine.js';

/**
 * Monkey-patches Jasmine's Suite and Spec so that they provide more accurate information,
 * and returns a bootstrapped instance of the {@apilink SerenityReporterForJasmine} to be registered with Jasmine.
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
 * @see {@apilink monkeyPatched}
 * @see {@apilink SerenityReporterForJasmine}
 *
 * @param {jasmine} jasmine - the global.jasmine instance
 * @param {SerenityReporterForJasmineConfig} config
 *
 * @returns {SerenityReporterForJasmine}
 */
export function bootstrap(jasmine = (global as any).jasmine, config: SerenityReporterForJasmineConfig = {}): SerenityReporterForJasmine {
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
