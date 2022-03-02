import { Activity, Actor, Answerable, AnswersQuestions, Interaction, Task, UsesAbilities } from '@serenity-js/core';

import { Switchable } from '../models';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to switch the context for future activities to a {@link Switchable}, such as {@link Page} or {@link PageElement}.
 *
 *  Please note that when the {@link PageElement} implementing {@link Switchable} represents an {@link iframe},
 *  using {@link Switch} will result in switching the top-level browsing context to that {@link iframe}.
 *
 *  When the {@link PageElement} represents any other {@link HTMLElement}, using {@link Switch}
 *  sets {@link HTMLElement#focus} on the specified element, if it can be focused.
 *  The focused element is the element which will receive keyboard {@link Press} events by default.
 *
 * @example <caption>Perform activities in the context of an iframe</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { By, Click, Enter, PageElement, Switch } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  // Lean Page Object describing a login form, embedded in an iframe
 *  class LoginForm {
 *      static iframe = () =>
 *          PageElement.located(By.css('iframe'))
 *              .describedAs('login form');
 *
 *      static usernameField = () =>
 *          PageElement.located(By.css('[data-testid="username"]'))
 *              .describedAs('username field');
 *
 *      static passwordField = () =>
 *          PageElement.located(By.css('[data-testid="password"]'))
 *              .describedAs('password field');
 *
 *      static submitButton = () =>
 *          PageElement.located(By.css('button[type="submit"]'))
 *              .describedAs('submit button');
 *  }
 *
 *  actorCalled('Francesca')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Switch.to(LoginForm.iframe).and(
 *              Enter.theValue('francesca@example.org').into(LoginForm.usernameField),
 *              Enter.theValue('correct-horse-battery-staple').into(LoginForm.passwordField),
 *              Click.on(LoginForm.submitButton),
 *          )
 *      )
 *
 * @example <caption>Perform activities in the context of another page</caption>
 *
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Click, Enter, Switch } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  actorCalled('Francesca')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Switch.to(Page.whichName(startsWith('popup'))).and(
 *              // perform some activities in the context of the new window
 *
 *              // optionally, close the window
 *              Page.current().close(),
 *          ),
 *
 *          // Note that switching back to the original page happens automatically
 *          // after the last activity from the list finishes
 *      )
 *
 * @example <caption>Perform activities in the context of a focused page element</caption>
 *
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Key, PageElement, Press, Switch, Value } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
 *
 *  const inputField = () =>
 *    PageElement.located(By.css('input'));
 *
 *  actorCalled('Francesca')
 *      .whoCan(BrowseTheWebWithWebdriverIO.using(browser))
 *      .attemptsTo(
 *          Switch.to(inputField()).and(
 *              Press.the('h', 'e', 'l', 'l', 'o'),
 *              Press.the(Key.Tab),
 *          ),
 *          Ensure.that(Value.of(inputField()), equals('hello'))
 *      )
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Switchable}
 * @see {@link SwitchableOrigin}
 */
export class Switch extends Interaction {

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to switch the context for future activities to a {@link Switchable}, such as {@link Page} or {@link PageElement}.
     *
     * @param {Answerable<Switchable>} switchable
     *
     * @returns {Switch}
     */
    static to(switchable: Answerable<Switchable>): Switch {
        return new Switch(switchable);
    }

    /**
     * @param {Answerable<Switchable>} switchable
     */
    constructor(private readonly switchable: Answerable<Switchable>) {
        super();
    }

    /**
     * @desc
     *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  to switch the context for future activities to a {@link Switchable}, such as {@link Page} or {@link PageElement},
     *  performs a sequence of `activities`, and then switch the context back.
     *
     * @param {Array<@serenity-js/core/lib/screenplay~Activity>} activities
     *  A sequence of activities to perform
     *
     * @returns {@serenity-js/core/lib/screenplay~Task}
     */
    and(...activities: Activity[]): Task {
        return new SwitchAndPerformActivities(this.switchable, activities);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay~Activity}
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const switchable = await actor.answer(this.switchable);

        await switchable.switchTo();
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor switches to ${ this.switchable }`;
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
        super();
    }

    async performAs(actor: Actor): Promise<void> {

        const switchable = await actor.answer(this.switchable);

        const origin = await switchable.switchTo();

        await actor.attemptsTo(
            ...this.activities,
        )

        await origin.switchBack();
    }

    toString(): string {
        return `#actor switches to ${ this.switchable }`;
    }
}
