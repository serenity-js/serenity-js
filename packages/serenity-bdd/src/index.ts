import { StageCrewMember } from '@serenity-js/core';

import { SerenityBDDReporter } from './stage';

export * from './stage';

export default function create(): StageCrewMember {
    return new SerenityBDDReporter();
}
