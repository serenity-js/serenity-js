import { Interaction } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  enable or disable automated synchronisation between Protractor and Angular.
 *
 *  Useful when a test scenario needs to interact with both Angular-based
 *  and non-Angular web apps (i.e. use an external sign on form).
 *
 *  More examples in [Cross-application testing with Serenity/JS](https://janmolak.com/cross-application-testing-with-serenity-js-4103a272b75b).
 *
 *  **Please note** if your tests interact with a non-Angular app you can disable
 *  synchronisation altogether in [`protractor.conf.js`](https://github.com/angular/protractor/blob/master/lib/config.ts).
 *
 * @example <caption>Disabling synchronisation temporarily</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, UseAngular, Navigate } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Angie')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          UseAngular.disableSynchronisation(),
 *          Navigate.to('https://mycompany.com/login'),
 *          // navigate to a non-Angular app, perform some activities...
 *
 *          UseAngular.disableSynchronisation(),
 *          Navigate.to('https://myapp.com'),
 *          // navigate to an Angular app, perform some more activities...
 *      );
 *
 * @example <caption>Disabling synchronisation in protractor.conf.js</caption>
 *  exports.config = {
 *      onPrepare: function () {
 *          return browser.waitForAngularEnabled(false);
 *      },
 *      // ... other config
 *  };
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class UseAngular {

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
     *  disable synchronisation between Protractor and Angular.
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static disableSynchronisation(): Interaction {
        return Interaction.where(`#actor disables synchronisation with Angular`, actor =>
            BrowseTheWeb.as(actor).enableAngularSynchronisation(false).then(() => void 0));
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
     *  enable synchronisation between Protractor and Angular.
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static enableSynchronisation(): Interaction {
        return Interaction.where(`#actor enables synchronisation with Angular`, actor =>
            BrowseTheWeb.as(actor).enableAngularSynchronisation(true).then(() => void 0));
    }
}
