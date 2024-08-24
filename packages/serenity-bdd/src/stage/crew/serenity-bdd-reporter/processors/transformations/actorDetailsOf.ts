import type { SerialisedActor } from '@serenity-js/core';
import type { SerialisedAbility } from '@serenity-js/core';

import type { SerenityBDDReporterConfig } from '../../SerenityBDDReporterConfig';
import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function actorDetailsOf<Context extends SerenityBDDReportContext>(
    actor: SerialisedActor,
    config: Required<SerenityBDDReporterConfig['reporter']>
): (context: Context) => Context {

    const abilityMapper = config.includeAbilityDetails ?
        abilityTypeAndOptions :
        abilityType;

    return (context: Context): Context => {

        context.actors.set(actor.name, actor);

        context.report.actors = Array.from(context.actors.values()).map(actor => ({
            name: actor.name,
            can: actor.abilities.map(ability => abilityMapper(ability)),
        }));

        return context;
    }
}

function abilityType(ability: SerialisedAbility): string {
    return [
        ability.type,
        ability.class ? ` (${ability.class})` : '',
    ].join('');
}

function abilityTypeAndOptions(ability: SerialisedAbility): string {
    return [
        abilityType(ability),
        ability.options && Object.keys(ability.options).length > 0
            ? ` ${JSON.stringify(ability.options, undefined, 1).replaceAll(/\n\s*/g, ' ').replaceAll(/"(\w+)":/g, '$1:')}`
            : '',
    ].join('');
}
