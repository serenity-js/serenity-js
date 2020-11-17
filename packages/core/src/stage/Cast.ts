import { Ability, Actor } from '../screenplay';

/**
 * @desc
 *  Describes the {@link Actor}s available to take part in the performance.
 *
 * @example <caption>Define a cast of actors interacting with a Web UI</caption>
 *
 *  import { engage, Actor, Cast } from '@serenity-js/core';
 *  import { BrowseTheWeb } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  class UIActors implements Cast {
 *      prepare(actor: Actor) {
 *          return actor.whoCan(BrowseTheWeb.using(protractor.browser));
 *      }
 *  }
 *
 *  beforeEach(() => engage(new UIActors()));
 *
 * @example <caption>Using a generic cast</caption>
 *
 *  import { engage, Cast } from '@serenity-js/core';
 *  import { BrowseTheWeb } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  beforeEach(() => engage(BrowseTheWeb.using(protractor.browser)));
 *
 * @example <caption>Preparing actors differently based on their name</caption>
 *
 *  import { actorCalled, engage, Cast } from '@serenity-js/core';
 *  import { BrowseTheWeb } from '@serenity-js/protractor';
 *  import { CallAnApi } from '@serenity-js/rest';
 *  import { protractor } from 'protractor';
 *
 *  class Actors implements Cast {
 *      prepare(actor: Actor) {
 *          switch (actor.name) {
 *              case 'James':
 *                  return actor.whoCan(BrowseTheWeb.using(protractor.browser));
 *              default:
 *                  return actor.whoCan(CallAnApi.at(protractor.browser.baseUrl));
 *          }
 *      }
 *  }
 *
 *  beforeEach(() => engage(new Actors()));
 *
 *  actorCalled('James') // returns an actor using a browser
 *  actorCalled('Alice') // returns an actor interacting with an API
 *
 * @see {@link Stage}
 * @interface
 */
export abstract class Cast {
    /**
     * @desc
     *  Creates a generic `Cast` implementation, where every actor
     *  is given all the abilities specified when the method is called.
     *
     * @param {Ability[]} abilities
     * @returns {Cast}
     */
    static whereEveryoneCan(...abilities: Ability[]): Cast {
        return new GenericCast(abilities);
    }

    /**
     * @desc
     *  Configures an {@link Actor} instantiated when {@link Stage#actor} is invoked.
     *
     * @param {Actor} actor
     * @return {Actor}
     *
     * @see {@link engage}
     */
    abstract prepare(actor: Actor): Actor;
}

/**
 * @package
 */
class GenericCast implements Cast {
    constructor(private readonly abilities: Ability[]) {
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(...this.abilities);
    }
}
