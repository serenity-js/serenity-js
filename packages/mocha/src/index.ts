import { serenity } from '@serenity-js/core';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io';
import type { MochaOptions, Runner } from 'mocha';

import { SerenityReporterForMocha } from './SerenityReporterForMocha';

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

    return new SerenityReporterForMocha(serenity, requirementsHierarchy, runner, options);
}

export = bootstrap;
