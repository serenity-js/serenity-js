import { Activity, Actor, Answerable, AnswersQuestions, Interaction, Task, UsesAbilities } from '@serenity-js/core';

import { Switchable } from '../models';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to switch the context for future activities to a {@link Switchable}, such as {@link Frame} or {@link Page}.
 *
 * @example <caption>Lean Page Object describing a login form, embedded in an iframe</caption>
 *
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class LoginForm {
 *      static iframe = () =>
 *          PageElement.located(By.css('iframe'))
 *              .describedAs('login form');
 *
 *      static usernameField = () =>
 *          PageElement.located(By.css('[data-test="username"]'))
 *              .describedAs('username field');
 *
 *      static passwordField = () =>
 *          PageElement.located(By.css('[data-test="password"]'))
 *              .describedAs('password field');
 *
 *      static submitButton = () =>
 *          PageElement.located(By.css('button[type="submit"]'))
 *              .describedAs('submit button');
 *  }
 *
 * @example <caption>Perform activities in the context of an iframe</caption>
 *
 *  import { actorCalled } from '@serenity-js/core';
 *  import { Switch, Enter, Click } from '@serenity-js/web';
 *  import { BrowseTheWebWithWebdriverIO } from '@serenity-js/webdriverio';
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
 *  import { Switch, Enter, Click } from '@serenity-js/web';
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
 * @see {@link BrowseTheWeb}
 */
export class Switch extends Interaction {

    /**
     * @desc
     *  Switches the context for future activities to a {@link Switchable}, such as {@link Frame} or {@link Page}.
     *
     * @param {Answerable<Switchable>} switchable
     *
     * @returns {Switch}
     */
    static to(switchable: Answerable<Switchable>): Switch {
        return new Switch(switchable);
    }

    constructor(private readonly switchable: Answerable<Switchable>) {
        super();
    }

    and(...activities: Activity[]): Task {
        return new SwitchAndPerformActivities(this.switchable, activities);
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const switchable = await actor.answer(this.switchable);

        await switchable.switchTo();
    }

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
