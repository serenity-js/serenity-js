import { RuntimeError, serenity } from '@serenity-js/core';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io/index.js';

import { monkeyPatched } from './monkeyPatched.js';
import { SerenityReporterForJasmine } from './SerenityReporterForJasmine.js';

/**
 * Bootstraps the Serenity/JS reporter for Jasmine.
 *
 * This function monkey-patches Jasmine's Suite and Spec constructors
 * so that they provide more accurate location information.
 *
 * For Jasmine 5.x, Suite and Spec are on the jasmine object directly.
 * For Jasmine 6.x, Suite and Spec are in jasmine.private.
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

    // Jasmine 6+ moved Suite and Spec to jasmine.private,
    // so we check both locations for backwards compatibility
    const Suite = jasmine.Suite || jasmine.private?.Suite;
    const Spec = jasmine.Spec || jasmine.private?.Spec;

    if (Suite && Spec) {
        // Monkey-patch Suite and Spec to capture location info
        const wrappers = {
            expectationResultFactory: originalExpectationResultFactory => ((attributes: { passed: boolean, error: Error }) => {
                const result = originalExpectationResultFactory(attributes);

                if (! attributes.passed && attributes.error instanceof RuntimeError) {
                    result.stack = attributes.error.stack;
                }

                return result;
            }),
        };

        // Jasmine 5.x: Suite and Spec are on jasmine directly
        if (jasmine.Suite && jasmine.Spec) {
            jasmine.Suite = monkeyPatched(jasmine.Suite, wrappers);
            jasmine.Spec = monkeyPatched(jasmine.Spec, wrappers);
        }
        // Jasmine 6+: Suite and Spec are in jasmine.private
        else if (jasmine.private?.Suite && jasmine.private?.Spec) {
            jasmine.private.Suite = monkeyPatched(jasmine.private.Suite, wrappers);
            jasmine.private.Spec = monkeyPatched(jasmine.private.Spec, wrappers);
        }
    }

    // For Jasmine 6+, patch the Expector and buildExpectationResult to restore expected/actual values
    // This is needed because Jasmine 6 removed these from expectation results
    patchBuildExpectationResultForExpectedActual(jasmine);
    patchExpectorForExpectedActual(jasmine);

    const cwd = Path.from(process.cwd());
    const requirementsHierarchy = new RequirementsHierarchy(
        new FileSystem(cwd),
        config?.specDirectory && cwd.resolve(Path.from(config?.specDirectory)),
    );

    return new SerenityReporterForJasmine(serenity, requirementsHierarchy);
}

/**
 * Patches Jasmine's buildExpectationResult to include expected/actual values
 * in the expectation result. This restores functionality that was removed in Jasmine 6.
 *
 * In Jasmine 6, the buildExpectationResult function no longer includes expected/actual
 * values in the result object. This patch wraps the function to preserve these values
 * when they are provided.
 *
 * @param jasmine - The global jasmine instance
 */
function patchBuildExpectationResultForExpectedActual(jasmine: any): void {
    // Access the private buildExpectationResult function
    const originalBuildExpectationResult = jasmine?.private?.buildExpectationResult;

    if (!originalBuildExpectationResult) {
        // buildExpectationResult not available, skip
        return;
    }

    jasmine.private.buildExpectationResult = function(options: any): any {
        const result = originalBuildExpectationResult(options);

        // Restore expected/actual values that Jasmine 6 removed
        if (options.expected !== undefined) {
            result.expected = options.expected;
        }
        if (options.actual !== undefined) {
            result.actual = options.actual;
        }

        return result;
    };
}

/**
 * Patches Jasmine's Expector.prototype.processResult to include expected/actual values
 * when calling addExpectationResult. This ensures the values are passed to
 * buildExpectationResult.
 *
 * @param jasmine - The global jasmine instance
 */
function patchExpectorForExpectedActual(jasmine: any): void {
    // Access the private Expector class through jasmine's internal structure
    // In Jasmine 6+, Expector is in jasmine.private.Expector
    const Expector = jasmine?.private?.Expector;

    if (!Expector || !Expector.prototype || !Expector.prototype.processResult) {
        // Expector not available, skip
        return;
    }

    Expector.prototype.processResult = function(result: any, errorForStack?: Error): void {
        const message = this.buildMessage(result);

        let expected = this.expected;
        if (Array.isArray(expected) && expected.length === 1) {
            expected = expected[0];
        }

        this.addExpectationResult(result.pass, {
            matcherName: this.matcherName,
            passed: result.pass,
            message: message,
            error: errorForStack ? undefined : result.error,
            errorForStack: errorForStack || undefined,
            // Include expected/actual values that Jasmine 6 removed
            expected: expected,
            actual: this.actual,
        });
    };
}

export interface SerenityReporterForJasmineConfig {
    specDirectory?: string;
}
