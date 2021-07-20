import {
    AnswersQuestions,
    Interaction,
    UsesAbilities,
} from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  close browser tabs or windows.
 *
 * @example <caption>Closing a browser tab or window</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Click, Close, Switch } from '@serenity-js/playwright';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Caleb')
 *      .whoCan(BrowseTheWeb.using(chromium))
 *      .attemptsTo(
 *          Click.on(someLinkThatOpensANewWindow),
 *
 *          Switch.toNewWindow().and(
 *              // perform activities in the context of the new window
 *              Close.currentWindow(),
 *          ),
 *      );
 *
 * @example <caption>Closing any new windows after a Jasmine test</caption>
 *  import 'jasmine';
 *
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { Close } from '@serenity-js/playwright';
 *
 *  after(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          Close.anyNewWindows(),
 *      ));
 *
 * @example <caption>Closing any new windows after a Mocha test</caption>
 *  import 'mocha';
 *
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { Close } from '@serenity-js/playwright';
 *
 *  after(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          Close.anyNewWindows(),
 *      ));
 *
 * @example <caption>Closing any new windows after a    Cucumber scenario</caption>
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { Close } from '@serenity-js/playwright';
 *  import { After } from 'cucumber';
 *
 *  After(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          Close.anyNewWindows(),
 *      ));
 *
 * @see {@link Switch}
 */
export class Close {
    /**
   * @desc
   *  Closes any windows other than the original one that
   *  the {@link @serenity-js/core/lib/screenplay/actor~Actor}
   *  has {@link Navigate}d to.
   *
   *  When the windows are closed, it switches the context
   *  back to the original window.
   *
   * @static
   * @returns {@link @serenity-js/core/lib/screenplay~Interaction}
   *
   * @see {@link Switch}
   */
    static anyNewWindows(): Interaction {
        return new CloseWindowsOtherThanCurrent();
    }

    /**
   * @desc
   *  Closes the currently focused browser window.
   *
   *  **Please note** that this interaction should be used to close
   *  pop-up windows or any new windows/tabs opened during the test
   *  rather than the _main_ window, which is managed by playwright.
   *
   *  See tests for usage examples.
   *
   * @static
   * @returns {@link @serenity-js/core/lib/screenplay~Interaction}
   *
   * @see {@link Switch}
   */
    static currentWindow(): Interaction {
        return new CloseCurrentWindow();
    }

    /**
   * @desc
   *  Closes the whole browser instance. You might need to do this after the test run is finished
   *
   * @static
   * @returns {@link @serenity-js/core/lib/screenplay~Interaction}
   *
   * @see {@link Switch}
   */
    static browser(): Interaction {
        return new CloseBrowser();
    }
}

/**
 * @package
 */
class CloseWindowsOtherThanCurrent extends Interaction {
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const browseTheWeb = actor.abilityTo(BrowseTheWeb);
        await browseTheWeb.closeAllOtherWindows();
    }

    toString(): string {
        return `#actor closes any new windows`;
    }
}

/**
 * @package
 */
class CloseCurrentWindow extends Interaction {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return BrowseTheWeb.as(actor).closePage();
    }

    toString(): string {
        return `#actor closes current browser window`;
    }
}

/**
 * @package
 */
class CloseBrowser extends Interaction {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return BrowseTheWeb.as(actor).closeBrowser();
    }

    toString(): string {
        return `#actor closes browser`;
    }
}
