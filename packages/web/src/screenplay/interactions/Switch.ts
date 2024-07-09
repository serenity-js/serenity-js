import type { Activity, Actor, Answerable, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Interaction, Task, the } from '@serenity-js/core';

import type { Switchable } from '../models';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to switch the context for future activities to a [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/), such as a [`Page`](https://serenity-js.org/api/web/class/Page/) or a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
 *
 * Please note that when the [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) implementing [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/) represents an [`iframe`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe),
 * using [`Switch`](https://serenity-js.org/api/web/class/Switch/) will result in switching the top-level browsing context to that [`iframe`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).
 *
 * When the [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) represents any other [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement),
 * using [`Switch`](https://serenity-js.org/api/web/class/Switch/) sets [`HTMLElement#focus`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)
 * on the specified element. Assuming it can be focused.
 *
 * **Note:** The focused element is the element which will receive keyboard [press](https://serenity-js.org/api/web/class/Press/) events by default.
 *
 * ## Perform activities in the context of an iframe
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { By, Click, Enter, PageElement, Switch } from '@serenity-js/web'
 *
 * // Lean Page Object describing a login form, embedded in an iframe
 * class LoginForm {
 *   static iframe = () =>
 *     PageElement.located(By.css('iframe'))
 *       .describedAs('login form')
 *
 *   static usernameField = () =>
 *     PageElement.located(By.css('[data-testid="username"]'))
 *       .describedAs('username field')
 *
 *   static passwordField = () =>
 *     PageElement.located(By.css('[data-testid="password"]'))
 *       .describedAs('password field')
 *
 *   static submitButton = () =>
 *     PageElement.located(By.css('button[type="submit"]'))
 *       .describedAs('submit button')
 *  }
 *
 *  await actorCalled('Francesca')
 *    .attemptsTo(
 *      Switch.to(LoginForm.iframe).and(
 *        Enter.theValue('francesca@example.org').into(LoginForm.usernameField()),
 *        Enter.theValue('correct-horse-battery-staple').into(LoginForm.passwordField()),
 *        Click.on(LoginForm.submitButton()),
 *      )
 *    )
 * ```
 *
 * ## Perform activities in the context of another page
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Click, Enter, Switch } from '@serenity-js/web'
 * import { browser } from '@wdio/globals'
 *
 * await actorCalled('Francesca')
 *   .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *   .attemptsTo(
 *     Switch.to(Page.whichName(startsWith('popup'))).and(
 *       // perform some activities in the context of the new window
 *
 *       // optionally, close the browser tab
 *       Page.current().close(),
 *     ),
 *
 *     // Note that switching back to the original page happens automatically
 *     // after the last activity from the list finishes
 *   )
 * ```
 *
 * ## Perform activities in the context of a focused page element
 *
 * ```ts
 * import { Ensure, equals } from '@serenity-js/assertions'
 * import { actorCalled } from '@serenity-js/core'
 * import { Key, PageElement, Press, Switch, Value } from '@serenity-js/web'
 * import { browser } from '@wdio/globals'
 *
 * const inputField = () =>
 *   PageElement.located(By.css('input'));
 *
 * await actorCalled('Francesca')
 *   .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *   .attemptsTo(
 *     Switch.to(inputField()).and(
 *       Press.the('h', 'e', 'l', 'l', 'o'),
 *       Press.the(Key.Tab),
 *     ),
 *     Ensure.that(Value.of(inputField()), equals('hello'))
 *   )
 * ```
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/)
 * - [`SwitchableOrigin`](https://serenity-js.org/api/web/interface/SwitchableOrigin/)
 *
 * @group Activities
 */
export class Switch extends Interaction {

    /**
     * Instructs the [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     * to switch the context for future activities to a [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/),
     * such as a [`Page`](https://serenity-js.org/api/web/class/Page/) or a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/).
     *
     * @param switchable
     */
    static to(switchable: Answerable<Switchable>): Switch {
        return new Switch(switchable);
    }

    protected constructor(private readonly switchable: Answerable<Switchable>) {
        super(the`#actor switches to ${ switchable }`);
    }

    /**
     * Instructs the [`Actor`](https://serenity-js.org/api/core/class/Actor/)
     * to switch the context for future activities to a [`Switchable`](https://serenity-js.org/api/web/interface/Switchable/),
     * such as a [`Page`](https://serenity-js.org/api/web/class/Page/) or a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/),
     * perform a sequence of `activities`, and then switch the context back.
     *
     * @param activities
     *  A sequence of activities to perform
     */
    and(...activities: Activity[]): Task {
        return new SwitchAndPerformActivities(this.switchable, activities);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const switchable = await actor.answer(this.switchable);

        await switchable.switchTo();
    }
}

/**
 * @package
 */
class SwitchAndPerformActivities extends Task {
    constructor(
        private readonly switchable: Answerable<Switchable>,
        private readonly activities: Activity[]
    ) {
        super(the `#actor switches to ${ switchable }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: Actor): Promise<void> {

        const switchable = await actor.answer(this.switchable);

        const origin = await switchable.switchTo();

        await actor.attemptsTo(
            ...this.activities,
        )

        await origin.switchBack();
    }
}
