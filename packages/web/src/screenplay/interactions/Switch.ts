import { Activity, Answerable, AnswersQuestions, Interaction, PerformsActivities, Task, UsesAbilities } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';
import { PageElement } from '../models';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to switch to a different [frame](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/frame),
 *  [inline frame](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe),
 *  or browser window/tab.
 *
 * @example <caption>Lean Page Object describing a login form, embedded in an iframe</caption>
 *
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class LoginForm {
 *      static iframe           = Target.the('login form').located(by.tagName('iframe'));
 *      static usernameField    = Target.the('username field').located(by.css('[data-test="username"]'));
 *      static passwordField    = Target.the('password field').located(by.css('[data-test="password"]'));
 *      static submitButton     = Target.the('submit button').located(by.css(`button[type='submit']`));
 *  }
 *
 * @example <caption>Switch to an iframe and back</caption>
 *
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Switch, Enter, Click } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Francesca')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Switch.toFrame(LoginForm.iframe),
 *
 *          Enter.theValue('francesca@example.org').into(LoginForm.usernameField),
 *          Enter.theValue('correct-horse-battery-staple').into(LoginForm.passwordField),
 *          Click.on(LoginForm.submitButton),
 *
 *          Switch.toParentFrame(),
 *      );
 *
 * @example <caption>Perform activities in the context of an iframe</caption>
 *
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Switch, Enter, Click } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Francesca')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Switch.toFrame(LoginForm.iframe).and(
 *              Enter.theValue('francesca@example.org').into(LoginForm.usernameField),
 *              Enter.theValue('correct-horse-battery-staple').into(LoginForm.passwordField),
 *              Click.on(LoginForm.submitButton),
 *          ),
 *          // Note that Switch.toParentFrame() is invoked automatically
 *      );
 *
 * @example <caption>Switch to a new window/tab and back</caption>
 *
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Switch, Close } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Francesca')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Switch.toNewWindow(), // or: Switch.toWindow(...)
 *
 *          // perform some activities in the context of the new window
 *
 *          Close.currentWindow(),
 *
 *          Switch.toOriginalWindow(),
 *      );
 *
 * @example <caption>Perform activities in the context of a different window/tab</caption>
 *
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Switch, Close } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Francesca')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Switch.toNewWindow().and(
 *              // perform some activities in the context of the new window
 *
 *              Close.currentWindow()
 *          ),
 *
 *          // Note that Switch.toOriginalWindow() is invoked automatically
 *      );
 *
 * @see {@link Close}
 * @see {@link BrowseTheWeb}
 */
export class Switch {

    /**
     * @desc
     *  Switches the current [browsing context](https://w3c.github.io/webdriver/#dfn-current-browsing-context)
     *  for future commands to a [frame](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/frame)
     *  or an [inline frame](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
     *  identified by its name, index or `Question<ElementFinder>`.
     *
     * @param {Answerable<ElementFinder | number | string>} targetOrIndex
     *
     * @returns {SwitchToFrame}
     *
     * @see {@link Switch.toParentFrame}
     * @see {@link Switch.toDefaultContent}
     * @see {@link Target}
     */
    static toFrame(targetOrIndex: Answerable<PageElement | number | string>): SwitchToFrame {
        return new SwitchToFrame(targetOrIndex);
    }

    /**
     * @desc
     *  Sets the current [browsing context](https://w3c.github.io/webdriver/#dfn-current-browsing-context)
     *  for future commands to the parent of the current browsing context,
     *  i.e. an `iframe` in which the current `iframe` is nested.
     *
     *  If the current context is the top-level browsing context, the context remains unchanged.
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Switch.toFrame}
     * @see https://w3c.github.io/webdriver/#switch-to-parent-frame
     * @see https://w3c.github.io/webdriver/#dfn-current-browsing-context
     */
    static toParentFrame(): Interaction {
        return new SwitchToParentFrame();
    }

    /**
     * @desc
     *  Switches the current [browsing context](https://w3c.github.io/webdriver/#dfn-current-browsing-context)
     *  for future commands to the first frame on the page, or the main document
     *  when a page contains [`iframe`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)s.
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link Switch.toFrame}
     */
    static toDefaultContent(): Interaction {
        return new SwitchToDefaultContent();
    }
}

/**
 * @package
 */
class SwitchToFrame extends Interaction {
    constructor(private readonly targetOrIndex: Answerable<PageElement | number | string>) {
        super();
    }

    and(...activities: Activity[]): Task {
        return new SwitchToFrameAndPerformActivities(this.targetOrIndex, activities);
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.targetOrIndex)
            .then((targetOrIndex: PageElement | number | string) => {
                return BrowseTheWeb.as(actor).switchToFrame(targetOrIndex);
            });
    }

    toString(): string {
        return `#actor switches to frame: ${ this.targetOrIndex }`;
    }
}

/**
 * @package
 */
class SwitchToFrameAndPerformActivities extends Task {
    constructor(
        private readonly targetOrIndex: Answerable<PageElement | number | string>,
        private readonly activities: Activity[]
    ) {
        super();
    }

    performAs(actor: PerformsActivities): PromiseLike<void> {
        return actor.attemptsTo(
            new SwitchToFrame(this.targetOrIndex),
            ...this.activities,
            new SwitchToParentFrame()
        )
    }

    toString(): string {
        return `#actor switches to frame: ${ this.targetOrIndex }`;
    }
}

/**
 * @package
 */
class SwitchToParentFrame extends Interaction {
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return BrowseTheWeb.as(actor).switchToParentFrame();
    }

    toString(): string {
        return `#actor switches to parent frame`;
    }
}

/**
 * @package
 */
class SwitchToDefaultContent extends Interaction {
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return BrowseTheWeb.as(actor).switchToDefaultContent();
    }

    toString(): string {
        return `#actor switches to default content`;
    }
}
