import { StageCrewMemberBuilder } from '@serenity-js/core';

import { ConsoleReporter, ConsoleReporterConfig } from './stage';

export * from './stage';

export default function create({ theme = 'auto' }: ConsoleReporterConfig): StageCrewMemberBuilder<ConsoleReporter> {
    return ConsoleReporter.fromJSON({ theme });
}
