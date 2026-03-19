import type { SerialisedAbility } from './abilities/index.js';

/**
 * @group Actors
 */
export interface SerialisedActor {
    name: string;
    abilities: Array<SerialisedAbility>;
}
