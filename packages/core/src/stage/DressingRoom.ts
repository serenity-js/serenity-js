import { Actor } from '../screenplay/actor';

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
 * @interface
 */
export abstract class DressingRoom {
    abstract prepare(actor: Actor): Actor;
}
