import { serenity } from '@serenity-js/core';
import { FileSystem, ModuleLoader, Path, RequirementsHierarchy } from '@serenity-js/core/io';
import type { MochaOptions, Runner } from 'mocha';

import { SerenityReporterForMocha } from './SerenityReporterForMocha.js';

/**
 * Registers a Mocha reporter that emits [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/)
 * and informs Serenity/JS when a test scenario starts, finishes, and with what result.
 */
function bootstrap(runner: Runner, options?: MochaOptions): SerenityReporterForMocha {
    const cwd = Path.from(process.cwd());
    const requirementsHierarchy = new RequirementsHierarchy(
        new FileSystem(cwd),
        options?.reporterOptions?.specDirectory && cwd.resolve(Path.from(options?.reporterOptions?.specDirectory)),
    );
    const loader = new ModuleLoader(cwd.value);
    const mochaVersion = loader.versionOf('mocha');

    return new SerenityReporterForMocha(serenity, requirementsHierarchy, mochaVersion, runner, options);
}

export default bootstrap;

/**
 * Root Hook Plugin for Mocha's parallel mode.
 * Ensures Serenity/JS waits for async operations (e.g. ability cleanup)
 * to complete after each test, even in worker processes where the reporter isn't active.
 */
export const mochaHooks = {
    async afterEach(): Promise<void> {
        await serenity.waitForNextCue();
    },
};

// CommonJS compatibility - assign to module.exports for Mocha reporter loading
// This is needed because Mocha expects module.exports to be the reporter function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = bootstrap;
    module.exports.default = bootstrap;
    module.exports.mochaHooks = mochaHooks;
}
