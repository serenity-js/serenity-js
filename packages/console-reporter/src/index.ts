import type { StageCrewMemberBuilder } from '@serenity-js/core';

import type { ConsoleReporterConfig } from './stage/index.js';
import { ConsoleReporter } from './stage/index.js';

export * from './stage/index.js';

export default function create(config: ConsoleReporterConfig = undefined): StageCrewMemberBuilder<ConsoleReporter> {
    return ConsoleReporter.fromJSON(config || { theme: 'auto' });
}
