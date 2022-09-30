import { StageCrewMemberBuilder } from '@serenity-js/core';

import { ConsoleReporter, ConsoleReporterConfig } from './stage';

export * from './stage';

// eslint-disable-next-line unicorn/no-useless-undefined
export default function create(config: ConsoleReporterConfig = undefined): StageCrewMemberBuilder<ConsoleReporter> {
    return ConsoleReporter.fromJSON(config || { theme: 'auto' });
}
