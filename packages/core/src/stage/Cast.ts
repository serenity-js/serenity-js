import { Ability, Actor } from '../screenplay';

/**
 * Describes the {@apilink Actor|actors} available to take part in the performance, a.k.a. the test scenario.
 *
 * ## Define a cast of actors interacting with a Web UI
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 * import { engage, Actor, Cast } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright, PlaywrightOptions } from '@serenity-js/playwright'
 * import { Browser, chromium } from 'playwright'
 *
 * export class UIActors implements Cast {
 *   constructor(
 *     private readonly browser: Browser,
 *     private readonly options?: PlaywrightOptions,
 *   ) {
 *   }
 *
 *   prepare(actor: Actor): Actor {
 *     return actor.whoCan(
 *       BrowseTheWebWithPlaywright.using(this.browser, this.options),
 *     )
 *   }
 * }
 *
 * beforeEach(async () => {
 *   const browser = await chromium.launch({ headless: true })
 *   engage(new UIActors(browser));
 * });
 * ```
 *
 * ## Using a generic cast
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 * import { engage, Cast } from '@serenity-js/core';
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { Browser, chromium } from 'playwright'
 *
 * beforeEach(async () => {
 *   const browser = await chromium.launch({ headless: true })
 *   engage(Cast.whereEveryoneCan(BrowseTheWebWithPlaywright.using(browser)));
 * });
 * ```
 *
 * ## Preparing actors differently based on their name
 *
 * ```ts
 * import { beforeEach } from 'mocha'
 * import { actorCalled, engage, Cast } from '@serenity-js/core'
 * import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'
 * import { CallAnApi } from '@serenity-js/rest'
 * import { Browser, chromium } from 'playwright'
 *
 * class Actors implements Cast {
 *   constructor(
 *     private readonly browser: Browser,
 *     private readonly options: PlaywrightOptions,
 *   ) {
 *   }
 *
 *   prepare(actor: Actor) {
 *     switch (actor.name) {
 *       case 'James':
 *         return actor.whoCan(BrowseTheWebWithPlaywright.using(this.browser, this.options));
 *       default:
 *         return actor.whoCan(CallAnApi.at(this.options.baseURL));
 *     }
 *   }
 * }
 *
 * beforeEach(async () => {
 *   const browser = await chromium.launch({ headless: true })
 *   engage(new Actors(browser, { baseURL: 'https://example.org' }));
 * });
 *
 * actorCalled('James') // returns an actor using a browser
 * actorCalled('Alice') // returns an actor interacting with an API
 * ```
 *
 * ## Learn more
 *
 * - {@apilink Stage}
 *
 * @group Stage
 */
export abstract class Cast {

    /**
     * Creates a generic `Cast` implementation, where every actor
     * is given all the abilities specified when the method is called.
     *
     * @param abilities
     */
    static whereEveryoneCan(...abilities: Ability[]): Cast {
        return new GenericCast(abilities);
    }

    /**
     * Configures an {@apilink Actor} instantiated when {@apilink Stage.actor} is invoked.
     *
     * @param actor
     *
     * #### Learn more
     * - {@apilink engage}
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
