import type { Answerable, Interaction, Optional, Question, QuestionAdapter } from '@serenity-js/core';
import { d } from '@serenity-js/core';

import { Page } from '../Page';

/**
 * Manages interactions with JavaScript modal dialog windows,
 * triggered by [window.alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert),
 * [window.confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm),
 * or [`window.prompt`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt),
 * and stores their `message` so that it can be asserted on once the dialog is handled.
 *
 * Note that in order to make handling modal windows
 * consistent across the various Web integration tools (such as Playwright, Puppeteer,
 * WebdriverIO or Selenium), Serenity/JS works as follows:
 * - Serenity/JS dismisses any modal dialogs by default and stores their message so that it can be asserted on.
 * - This behaviour can be changed by invoking {@apilink ModalDialog.acceptNext}, {@apilink ModalDialog.acceptNextWithValue]], or [[ModalDialog.dismissNext} before the dialog is triggered, as per the below examples.
 * - Serenity/JS also allows you to `Wait.until(ModalDialog, isPresent())` so that you can synchronise your tests
 *   with modal dialogs that appear after a delay.
 *
 * ## Example HTML widget
 *
 * In the below example widget, clicking on the button results in a [confirmation dialog](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm)
 * appearing.
 *
 * ```html
 * <button id="trigger" onclick="trigger()">Trigger Alert</button>
 * <p id="result"></p>
 *
 * <script>
 *   function trigger() {
 *     document.getElementById("result").innerHTML = (
 *       function () {
 *         return confirm('Continue?')
 *           ? 'accepted'
 *           : 'dismissed';
 *       }
 *     )();
 *   }
 * </script>
 * ```
 *
 * ## Modal dialog gets dismissed by default
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { By, Click, Text, PageElement, ModalDialog } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * const Example = {
 *   trigger: () =>
 *     PageElement.located(By.id('trigger')).describedAs('the modal dialog trigger'),
 *
 *   result: () =>
 *     PageElement.located(By.id('result')).describedAs('result'),
 * }
 *
 * await actorCalled('Nick').attemptsTo(
 *   Click.on(Example.trigger()),
 *
 *   Ensure.that(ModalDialog.lastDialogState(), equals('dismissed')),
 *
 *   Ensure.that(Text.of(Example.result()), equals('dismissed')),
 * )
 * ```
 *
 * ## Changing modal dialog handler
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { By, Click, Text, PageElement, ModalDialog } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * const Example = {
 *   trigger: () =>
 *     PageElement.located(By.id('trigger')).describedAs('the modal dialog trigger'),
 *
 *   result: () =>
 *     PageElement.located(By.id('result')).describedAs('result'),
 * }
 *
 * await actorCalled('Nick').attemptsTo(
 *   ModalDialog.acceptNext(),
 *   // or: ModalDialog.acceptNextWithValue('some value'),
 *   // or: ModalDialog.dismissNext(),
 *
 *   Click.on(Example.trigger),
 *
 *   Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),
 *
 *   Ensure.that(Text.of(Example.result), equals('accepted')),
 * )
 * ```
 *
 * ## Learn more
 * - {@apilink Optional}
 *
 * @group Models
 */
export abstract class ModalDialog implements Optional {

    /**
     * Returns a promise that resolves to `true`
     * when a modal dialog has been handled, so accepted or dismissed.
     * Returns `false` for dialogs that haven't been handled yet.
     *
     * Useful when a JavaScript modal dialog is generated after a delay,
     * e.g. triggered by `setTimeout`.
     *
     * #### Example usage
     *
     * ```ts
     * import { actorCalled, Wait } from '@serenity-js/core'
     * import { Ensure, equals, isPresent } from '@serenity-js/assertions'
     * import { ModalDialog } from '@serenity-js/web'
     *
     * await actorCalled('Nick').attemptsTo(
     *   ModalDialog.acceptNext(),
     *   Wait.until(ModalDialog, isPresent()),
     *   Ensure.that(ModalDialog.lastDialogState(), equals('accepted')),
     * )
     * ```
     */
    static isPresent(): Question<Promise<boolean>> {
        return Page.current().modalDialog().last().isPresent();
    }

    /**
     * Produces an {@apilink Interaction|interaction} that invokes {@apilink ModalDialog.acceptNext}.
     */
    static acceptNext(): Interaction {
        return Page.current().modalDialog().acceptNext()
            .describedAs('#actor accepts next modal dialog window');
    }

    /**
     * Produces an {@apilink Interaction|interaction} that invokes {@apilink ModalDialog.acceptNextWithValue}.
     *
     * @param value
     */
    static acceptNextWithValue(value: Answerable<string | number>): Interaction {
        return Page.current().modalDialog().acceptNextWithValue(value)
            .describedAs(d`#actor accepts next modal dialog window with value ${ value }`);
    }

    /**
     * Produces an {@apilink Interaction|interaction} that invokes {@apilink ModalDialog.dismissNext}.
     */
    static dismissNext(): Interaction {
        return Page.current().modalDialog().dismissNext()
            .describedAs(d`#actor dismisses next modal dialog window`);
    }

    /**
     * {@apilink QuestionAdapter} that resolves to {@apilink ModalDialog.message} for the current {@apilink Page}.
     */
    static lastDialogMessage(): QuestionAdapter<string> {
        return Page.current().modalDialog().last().message()
            .describedAs(`last dialog message`);
    }

    /**
     * {@apilink QuestionAdapter} that resolves to {@apilink ModalDialog.state} for the current {@apilink Page}.
     */
    static lastDialogState(): QuestionAdapter<string> {
        return Page.current().modalDialog().last().state()
            .describedAs(`last dialog state`);
    }

    /**
     * Returns the message of the last modal dialog handled,
     * or rejects the promise with a {@apilink LogicError}
     * when no modal dialogs have been observed yet.
     *
     * @returns
     *  Message of the last handled dialog, or a `Promise`
     *  rejected with a {@apilink LogicError}
     *  when no dialog has been handled yet.
     */
    abstract message(): Promise<string>;

    /**
     * Returns a promise that resolves to `true`
     * when a modal dialog has been handled, so either accepted or dismissed.
     * Returns `false` for dialogs that haven't been handled yet.
     *
     * Useful when a JavaScript modal dialog is generated after a delay,
     * e.g. triggered by `setTimeout`.
     */
    abstract isPresent(): Promise<boolean>;

    /**
     * Returns `accepted` or `dismissed` for dialogs that have been handled,
     * or `absent` for those that haven't been handled yet.
     */
    state(): string {
        return this.constructor.name
            .replace('ModalDialog', '')
            .toLowerCase();
    }
}
