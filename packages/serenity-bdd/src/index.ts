import type { StageCrewMemberBuilder } from '@serenity-js/core';

import type { SerenityBDDReporterConfig } from './stage';
import { SerenityBDDReporter } from './stage';

export * from './stage';

export default function create(config: SerenityBDDReporterConfig = {}): StageCrewMemberBuilder<SerenityBDDReporter> {
    return SerenityBDDReporter.fromJSON(config);
}
