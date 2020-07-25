import { Question } from '@serenity-js/core';
import { AlertPromise, error as errors } from 'selenium-webdriver';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Represents a modal dialog window created using
 *  [`Window.alert()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert),
 *  [`Window.prompt()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt) or
 *  [`Window.confirm()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm).
 *
 *  Check out the examples below, as well as the unit tests demonstrating the usage.
 *
 * @example <caption>Widget</caption>
 *  <button
 *      data-test="trigger"
 *      onclick="alert('Hello!')">Trigger Alert</button>
 *
 * @example <caption>Usage</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Accept, BrowseTheWeb, Click, ModalDialog, Target } from '@serenity-js/protractor';
 *  import { browser, by } from 'protractor';
 *
 *  class Widget {
 *      static trigger = Target.the('trigger button')
 *          .located(by.css('[data-test="trigger"]'));
 *  }
 */
export class ModalDialog {

    /**
     * @desc
     *  A modal dialog window that could be {@link Accept}ed or {@link Dismiss}ed.
     *
     *  If the window was created using [`Window.prompt()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt)
     *  you can use the {@link @serenity-js/core/lib/screenplay~Interaction} to {@link Enter} with it too.
     *
     * @example <caption>Usage</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { Accept, BrowseTheWeb, Click, ModalDialog, Target } from '@serenity-js/protractor';
     *  import { browser, by } from 'protractor';
     *
     *  actorCalled('Nick')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Click.on(Widget.trigger),
     *          Accept.the(ModalDialog.window()),
     *      );
     *
     * @see {@link Accept}
     * @see {@link Dismiss}
     * @see {@link Enter}
     */
    static window(): Question<AlertPromise> {
        return Question.about<AlertPromise>(`the modal dialog window`, actor =>
            BrowseTheWeb.as(actor).alert()
        );
    }

    /**
     * @desc
     *  Resolves to `true` if the modal dialog window is present, or `false` if it's not.
     *
     * @example <caption>Usage</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Click, ModalDialog } from '@serenity-js/protractor';
     *  import { Ensure, isFalse, isTrue } from '@serenity-js/assertions';
     *  import { browser, by } from 'protractor';
     *
     *  actorCalled('Nick')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Ensure.that(ModalDialog.hasPoppedUp(), isFalse()),
     *          Click.on(Widget.trigger),
     *          Ensure.that(ModalDialog.hasPoppedUp(), isTrue()),
     *      );
     *
     * @see {@link @serenity-js/assertions/lib/screenplay~Ensure}
     * @see {@link Wait}
     */
    static hasPoppedUp(): Question<Promise<boolean>> {
        return Question.about<Promise<boolean>>(`the modal dialog has popped up`, actor =>
            promiseOf(BrowseTheWeb.as(actor).alert()).then(() => true, error => {
                // Based on:
                // https://github.com/SeleniumHQ/selenium/blob/941dc9c6b2e2aa4f701c1b72be8de03d4b7e996a/javascript/node/selenium-webdriver/lib/until.js#L107
                return ! (error instanceof errors.NoSuchAlertError
                    // XXX: Workaround for GeckoDriver error `TypeError: can't convert null
                    // to object`. For more details, see
                    // https://github.com/SeleniumHQ/selenium/pull/2137
                    || (error instanceof errors.WebDriverError
                        && error.message === `can't convert null to object`)
                );
            })
        );
    }

    /**
     * @desc
     *  Resolves to the message displayed on the modal dialog window.
     *
     * @example <caption>Usage</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Click, ModalDialog, Wait } from '@serenity-js/protractor';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *  import { browser, by } from 'protractor';
     *
     *  actorCalled('Nick')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Click.on(Widget.trigger),
     *          Wait.until(ModalDialog.hasPoppedUp(), isTrue()), // optionally
     *          Ensure.that(ModalDialog.message(), equals('Hello!')),
     *      );
     *
     * @see {@link @serenity-js/assertions/lib/screenplay~Ensure}
     * @see {@link Wait}
     */
    static message(): Question<Promise<string>> {
        return Question.about<Promise<string>>(`the modal dialog message`, actor =>
            promiseOf(BrowseTheWeb.as(actor).alert().getText())
        );
    }
}
