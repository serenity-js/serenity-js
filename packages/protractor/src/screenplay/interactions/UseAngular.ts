import { Interaction } from '@serenity-js/core';

import { BrowseTheWebWithProtractor } from '../abilities';
import { ProtractorPage } from '../models';

/**
 * Instructs the {@apilink Actor} to enable or disable automated synchronisation between Protractor and Angular 1.x application.
 *
 * Useful when a test scenario needs to interact with both Angular-based
 * and non-Angular web apps, e.g. use an external sign-in form.
 *
 * **Please note** if your tests interact with a non-Angular app you can disable
 * synchronisation altogether in [`protractor.conf.js`](https://github.com/angular/protractor/blob/master/lib/config.ts).
 *
 * **Warning:** this interaction is Protractor-specific, so using it in your tests
 * will reduce their portability across test integration tools.
 *
 * ## Disabling synchronisation temporarily
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { UseAngular } from '@serenity-js/protractor'
 * import { Navigate } from '@serenity-js/web'
 * import { protractor } from 'protractor'
 *
 * await actorCalled('Angie')
 *   .whoCan(BrowseTheWeb.using(protractor.browser))
 *   .attemptsTo(
 *     UseAngular.disableSynchronisation(),
 *     Navigate.to('https://mycompany.com/login'),
 *     // navigate to a non-Angular app, perform some activities...
 *
 *     UseAngular.disableSynchronisation(),
 *     Navigate.to('https://myapp.com'),
 *     // navigate to an Angular app, perform some more activities...
 *   )
 * ```
 *
 * ## Disabling synchronisation with Angular in `protractor.conf.js`
 *
 * ```js
 * exports.config = {
 *   onPrepare: function () {
 *     return browser.waitForAngularEnabled(false);
 *   },
 *   // ... other config
 * }
 * ```
 *
 * ## Learn more
 *
 * - [Cross-application testing with Serenity/JS](https://janmolak.com/cross-application-testing-with-serenity-js-4103a272b75b)
 *
 * @group Activities
 */
export class UseAngular {

    /**
     * Produces an {@apilink Interaction} that instructs the {@apilink Actor} to disable
     * synchronisation between Protractor and an Angular 1.x app.
     */
    static disableSynchronisation(): Interaction {
        return Interaction.where(`#actor disables synchronisation with Angular`, async actor => {
            const page = await (actor.abilityTo(BrowseTheWebWithProtractor) as BrowseTheWebWithProtractor).currentPage() as ProtractorPage;

            await page.enableAngularSynchronisation(false)
        });
    }

    /**
     * Produces an {@apilink Interaction} that instructs the {@apilink Actor} to enable
     * synchronisation between Protractor and an Angular 1.x app.
     */
    static enableSynchronisation(): Interaction {
        return Interaction.where(`#actor enables synchronisation with Angular`,  async actor => {
            const page = await (actor.abilityTo(BrowseTheWebWithProtractor) as BrowseTheWebWithProtractor).currentPage() as ProtractorPage;

            await page.enableAngularSynchronisation(true)
        });
    }
}
