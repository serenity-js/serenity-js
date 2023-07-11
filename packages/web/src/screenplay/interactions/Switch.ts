import type { Activity, Actor, Answerable, AnswersQuestions, UsesAbilities } from '@serenity-js/core';
import { Interaction, Task } from '@serenity-js/core';

import type { Switchable } from '../models';

/**
 * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * to switch the context for future activities to a {@apilink Switchable}, such as a {@apilink Page} or a {@apilink PageElement}.
 *
 * Please note that when the {@apilink PageElement} implementing {@apilink Switchable} represents an {@apilink iframe},
 * using {@apilink Switch} will result in switching the top-level browsing context to that {@apilink iframe}.
 *
 * When the {@apilink PageElement} represents any other [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement),
 * using {@apilink Switch} sets [`HTMLElement#focus`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)
 * on the specified element. Assuming it can be focused.
 *
 * **Note:** The focused element is the element which will receive keyboard {@apilink Press} events by default.
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
 * - {@apilink BrowseTheWeb}
 * - {@apilink Switchable}
 * - {@apilink SwitchableOrigin}
 *
 * @group Activities
 */
export class Switch extends Interaction {

    /**
     * Instructs the {@apilink Actor}
     * to switch the context for future activities to a {@apilink Switchable},
     * such as a {@apilink Page} or a {@apilink PageElement}.
     *
     * @param switchable
     */
    static to(switchable: Answerable<Switchable>): Switch {
        return new Switch(switchable);
    }

    protected constructor(private readonly switchable: Answerable<Switchable>) {
        super(`#actor switches to ${ switchable }`);
    }

    /**
     * Instructs the {@apilink Actor}
     * to switch the context for future activities to a {@apilink Switchable},
     * such as a {@apilink Page} or a {@apilink PageElement},
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
        super(`#actor switches to ${ switchable }`);
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
