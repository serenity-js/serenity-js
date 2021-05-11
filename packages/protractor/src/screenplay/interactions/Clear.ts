import { AnswersQuestions, Interaction, LogicError, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder, protractor } from 'protractor';
import { withAnswerOf } from '../withAnswerOf';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  clear the `value` of a [form `input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
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
 * @example <caption>Clearing the value of an input field</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Clear, Enter, Value } from '@serenity-js/protractor';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { protractor } from 'protractor';
 *
 *  actorCalled('Inés')
 *      .whoCan(BrowseTheWeb.using(protractor.browser))
 *      .attemptsTo(
 *          Enter.theValue('Hello world!').into(Form.exampleInput),
 *          Ensure.that(Value.of(Form.exampleInput), equals('Hello world!')),
 *
 *          Clear.theValueOf(Form.exampleInput),
 *          Ensure.that(Value.of(Form.exampleInput), equals('')),
 *      );
 *
 * @see {@link BrowseTheWeb}
 * @see {@link Enter}
 * @see {@link Value}
 * @see {@link Target}
 * @see {@link @serenity-js/assertions~Ensure}
 * @see {@link @serenity-js/assertions/lib/expectations~equals}
 *
 * @extends {@serenity-js/core/lib/screenplay~Interaction}
 */
export class Clear extends Interaction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Question<ElementFinder> | ElementFinder} field
     *  The field to be cleared
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static theValueOf(field: Question<ElementFinder> | ElementFinder): Interaction {
        return new Clear(field);
    }

    /**
     * @param {Question<ElementFinder> | ElementFinder} field
     *  The field to be cleared
     */
    constructor(private readonly field: Question<ElementFinder> | ElementFinder) {
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
        return withAnswerOf(actor, this.field, (elf: ElementFinder) =>
            elf.getAttribute('value').then(value => {
                if (value === null) {
                    throw new LogicError(
                        `${ this.capitaliseFirstLetter(this.field.toString()) } doesn't seem to have a 'value' attribute that could be cleared.`,
                    );
                }

                return this.removeCharactersFrom(elf, value.length);
            }));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor clears the value of ${ this.field }`;
    }

    private capitaliseFirstLetter(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    private removeCharactersFrom(elf: ElementFinder, numberOfCharacters: number): PromiseLike<void> {
        return numberOfCharacters === 0
            ? Promise.resolve(void 0)
            : elf.sendKeys(
                protractor.Key.END,
                ...this.times(numberOfCharacters, protractor.Key.BACK_SPACE),
            );
    }

    private times(length: number, key: string) {
        return Array.from({ length }).map(() => key);
    }
}
