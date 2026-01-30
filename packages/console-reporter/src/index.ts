import type { StageCrewMemberBuilder } from '@serenity-js/core';

import type { ConsoleReporterConfig } from './stage';
import { ConsoleReporter } from './stage';

export * from './stage';

export default function create(config: ConsoleReporterConfig = undefined): StageCrewMemberBuilder<ConsoleReporter> {
    return ConsoleReporter.fromJSON(config || { theme: 'auto' });
}
