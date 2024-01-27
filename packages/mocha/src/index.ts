import { serenity } from '@serenity-js/core';
import { FileSystem, Path, RequirementsHierarchy } from '@serenity-js/core/lib/io';
import type { MochaOptions, Runner } from 'mocha';

import { SerenityReporterForMocha } from './SerenityReporterForMocha';

/**
 * Registers a Mocha reporter that emits {@apilink DomainEvent|Serenity/JS domain events}
 * and informs Serenity/JS when a test scenario starts, finishes, and with what result.
 */
function bootstrap(runner: Runner, options?: MochaOptions): SerenityReporterForMocha {
    const requirementsHierarchy = new RequirementsHierarchy(new FileSystem(Path.from(process.cwd())));
    return new SerenityReporterForMocha(serenity, requirementsHierarchy, runner, options);
}

export = bootstrap;
