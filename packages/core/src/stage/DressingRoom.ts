import { Ability, Actor } from '../screenplay';

/**
 * @desc
 *  Prepares the {@link Actor} for the performance.
 *
 * @example <caption>A dressing room for actors interacting with a Web UI</caption>
 *
 *  import { serenity, Actor, DressingRoom } from '@serenity-js/core'
 *  import { BrowseTheWeb } from '@serenity-js/protractor'
 *  import { protractor } from 'protractor'
 *
 *  class UIActors implements DressingRoom {
 *      prepare(actor: Actor) {
 *          return actor.whoCan(BrowseTheWeb.using(protractor.browser));
 *      }
 *  }
 *
 *  const stage = serenity.callToStageFor(new UIActors());
 *
 * @see {@link Stage}
 * @see {@link Cast}
 * @interface
 *
 * @deprecated Please use the Cast instead
 */
export abstract class DressingRoom {
    /**
     * @desc
     *  Creates a generic `DressingRoom` implementation, where every actor
     *  is given all the abilities specified when the method is called.
     *
     * @param {Ability[]} abilities
     * @returns {DressingRoom}
     */
    static whereEveryoneCan(...abilities: Ability[]): DressingRoom {
        return new GenericDressingRoom(abilities);
    }

    abstract prepare(actor: Actor): Actor;
}

/**
 * @package
 */
class GenericDressingRoom implements DressingRoom {
    constructor(private readonly abilities: Ability[]) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(...this.abilities);
    }
}
