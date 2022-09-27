import { StageCrewMemberBuilder } from '@serenity-js/core';

import { ConsoleReporter } from './stage';

export * from './stage';

export default function create(config: { theme: 'light' | 'dark' | 'mono' | 'auto' } = { theme: 'auto' }): StageCrewMemberBuilder<ConsoleReporter> {
    return ConsoleReporter.fromJSON(config);
}
