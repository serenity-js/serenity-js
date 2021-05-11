import { AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  close browser tabs or windows.
 *
 * @example <caption>Closing a browser tab or window</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Click, Close, Switch } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Caleb')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
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
 *  import { Close } from '@serenity-js/protractor';
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
 *  import { Close } from '@serenity-js/protractor';
 *
 *  after(() =>
 *      actorInTheSpotlight().attemptsTo(
 *          Close.anyNewWindows(),
 *      ));
 *
 * @example <caption>Closing any new windows after a    Cucumber scenario</caption>
 *  import { actorInTheSpotlight } from '@serenity-js/core';
 *  import { Close } from '@serenity-js/protractor';
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
        return new CloseWindowsOtherThan(actor => BrowseTheWeb.as(actor).getOriginalWindowHandle(), `#actor closes any new windows`);
    }

    /**
     * @desc
     *  Closes the currently focused browser window.
     *
     *  **Please note** that this interaction should be used to close
     *  pop-up windows or any new windows/tabs opened during the test
     *  rather than the _main_ window, which is managed by Protractor.
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
}

/**
 * @package
 */
class CloseWindowsOtherThan extends Interaction {
    constructor(
        private readonly windowToKeepBy: (actor: UsesAbilities & AnswersQuestions) => Promise<string>,
        private readonly description: string = `#actor closes several windows`,
    ) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return this.windowToKeepBy(actor)
            .then(windowToKeep => this.windowsOtherThan(windowToKeep, actor)
                .then(windowsToClose => this.closeAll(windowsToClose, actor))
                .then(() => this.switchTo(windowToKeep, actor)),
            );
    }

    toString(): string {
        return this.description;
    }

    /**
     * @param {string} windowToKeep
     * @param {UsesAbilities & AnswersQuestions} actor
     * @private
     */
    private windowsOtherThan(windowToKeep: string, actor: UsesAbilities & AnswersQuestions) {
        return BrowseTheWeb.as(actor).getAllWindowHandles()
            .then(allWindows =>
                this.isDefined(windowToKeep) && allWindows.length > 1
                    ? allWindows.filter(handle => handle !== windowToKeep)
                    : []
            )
    }

    /**
     * @param {string[]} windows
     * @param {UsesAbilities & AnswersQuestions} actor
     * @private
     */
    private closeAll(windows: string[], actor: UsesAbilities & AnswersQuestions) {
        return windows.reduce(
            (previous, handle) => {
                return previous
                    .then(() => BrowseTheWeb.as(actor).switchToWindow(handle))
                    .then(() => BrowseTheWeb.as(actor).closeCurrentWindow());
            },
            Promise.resolve()
        );
    }

    /**
     * @param {string} window
     * @param {UsesAbilities & AnswersQuestions} actor
     * @private
     */
    private switchTo(window: string, actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return this.isDefined(window)
            ? BrowseTheWeb.as(actor).switchToWindow(window)
            : Promise.resolve();
    }

    /**
     * @param {any} value
     * @private
     */
    private isDefined(value: any) {
        return value !== undefined && value !== null;
    }
}

/**
 * @package
 */
class CloseCurrentWindow extends Interaction {
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return BrowseTheWeb.as(actor).closeCurrentWindow();
    }

    toString(): string {
        return `#actor closes current browser window`;
    }
}
