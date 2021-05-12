import { Answerable, AnswersQuestions, Interaction, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { AlertPromise } from 'selenium-webdriver';
import { withAnswerOf } from '../withAnswerOf';
import { EnterBuilder } from './EnterBuilder';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  enter a value into a [form `input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) field.
 *
 * @example <caption>Example widget</caption>
 *  <form>
 *    <input type="text" name="example" id="example" />
 *  </form>
 *
 * @example <caption>Lean Page Object describing the widget</caption>
 *  import { Target } from '@serenity-js/protractor';
 *  import { by } from 'protractor';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .located(by.id('example'));
 *  }
 *
 * @example <caption>Enternig the value into a form field</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Enter } from '@serenity-js/protractor';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Esme')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Enter.theValue('Hello world!').into(Form.exampleInput),
 *      );
 *
 * @see {@link Target}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class Enter extends Interaction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Question<ElementFinder> | ElementFinder} value
     *  The value to be entered
     *
     * @returns {EnterBuilder}
     */
    static theValue(value: Answerable<string | number>): EnterBuilder {
        return {
            into: (field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise) =>
                new Enter(value, field),
        };
    }

    /**
     * @param {@serenity-js/core/lib/screenplay~Answerable<string | number>} value
     *  The value to be entered
     *
     * @param {Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise} field
     *  The field to enter the value into
     */
    constructor(
        private readonly value: Answerable<string | number>,
        private readonly field: Question<ElementFinder> | ElementFinder | Question<AlertPromise> | AlertPromise,
    ) {
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
        return actor.answer(this.value)
            .then(value => withAnswerOf(actor, this.field, (elf: ElementFinder | AlertPromise) =>
                elf.sendKeys(`${ value }`))
            );
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor enters ${ this.value } into ${ this.field }`;
    }
}
