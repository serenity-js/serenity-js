import { AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { AlertPromise } from 'selenium-webdriver';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  dismiss a {@link ModalDialog}.
 *
 * @example <caption>Example widget</caption>
 *  <button
 *      data-test="trigger"
 *      onclick="alert('hello!')">Trigger Alert</button>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class Widget {
 *      static trigger = Target.the('trigger button')
 *          .located(by.css('[data-test="trigger"]'));
 *  }
 *
 * @example <caption>Dismissing a modal dialog window</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Click, Dismiss, ModalDialog } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Nick')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Click.on(Widget.trigger),
 *          Dismiss.the(ModalDialog.window()),
 *      );
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 *
 * @see {@link Accept}
 * @see {@link ModalDialog}
 */
export class Dismiss extends Interaction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
     *  with a {@link ModalDialog.window} the {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  will dismiss.
     *
     * @param {@serenity-js/core/lib/screenplay~Question<AlertPromise> | AlertPromise} modalDialogWindow
     *  The modal dialog window to dismiss
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     *
     * @see {@link ModalDialog.window}
     * @see {@link @serenity-js/core/lib/screenplay~Question}
     */
    static the(modalDialogWindow: Question<AlertPromise> | AlertPromise): Interaction {
        return new Dismiss(modalDialogWindow);
    }

    /**
     * @param {@serenity-js/core/lib/screenplay~Question<AlertPromise> | AlertPromise} modalDialogWindow
     *  The modal dialog window to dismiss
     *
     * @see {@link ModalDialog.window}
     */
    constructor(private readonly modalDialogWindow: Question<AlertPromise> | AlertPromise) {
        super();
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     *  An {@link @serenity-js/core/lib/screenplay/actor~Actor} to perform this {@link @serenity-js/core/lib/screenplay~Interaction}
     *
     * @returns {PromiseLike<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.modalDialogWindow)
            .then(alert => alert.dismiss());
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor dismisses ${ this.modalDialogWindow }`;
    }
}
