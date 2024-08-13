import type { SerialisedActor } from '@serenity-js/core';
import type { CorrelationId } from '@serenity-js/core/lib/model';

import type { SerenityBDDReportContext } from '../SerenityBDDReportContext';

/**
 * @package
 */
export function actorDetailsOf<Context extends SerenityBDDReportContext>(sceneId: CorrelationId, actor: SerialisedActor): (context: Context) => Context {
    return (context: Context): Context => {

        context.actors.set(actor.name, actor);

        context.report.actors = Array.from(context.actors.values()).map(actor => ({
            name: actor.name,
            can:  actor.abilities.map(ability => {
                const { type, class: implementationClass, options } = ability;

                return [
                    type,
                    implementationClass ? ` (${ implementationClass })` : '',
                    options && Object.keys(options).length > 0
                        ? ` ${ JSON.stringify(options, undefined, 1).replaceAll(/\n\s*/g, ' ').replaceAll(/"(\w+)":/g, '$1:') }`
                        : '',
                ].join('');
            }),
        }));

        return context;
    }
}
