import type { Actor, Cast } from '@serenity-js/core';

import { FetchRemoteResources } from '../screenplay/abilities/FetchRemoteResources.js';
import { UseNodeModules } from '../screenplay/abilities/UseNodeModules.js';

/**
 * A Cast that creates actors with CLI abilities.
 *
 * @package
 */
export class CliActors implements Cast {
    constructor(private readonly projectRoot: string) {}

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            UseNodeModules.at(this.projectRoot),
            FetchRemoteResources.using(),
        );
    }
}
