/* istanbul ignore file covered in integration tests */
import { serenity } from '@serenity-js/core';
import { MochaOptions, Runner } from 'mocha';

import { SerenityReporterForMocha } from './SerenityReporterForMocha';

/**
 * Registers a Mocha reporter that emits {@apilink DomainEvent|Serenity/JS domain events}
 * and informs Serenity/JS when a test scenario starts, finishes, and with what result.
 */
function bootstrap(runner: Runner, options?: MochaOptions): SerenityReporterForMocha {
    return new SerenityReporterForMocha(serenity, runner, options);
}

export = bootstrap;
