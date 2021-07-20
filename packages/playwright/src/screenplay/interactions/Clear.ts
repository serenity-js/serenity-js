import {
    Answerable,
    AnswersQuestions,
    Interaction,
    LogicError,
    UsesAbilities,
} from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { ElementHandleAnswer } from '../../answerTypes/ElementHandleAnswer';
import { Value } from '../questions';

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
 *  import { Target } from '@serenity-js/playwright';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .selectedBy('[id="example"]');
 *  }
 *
 * @example <caption>Clearing the value of an input field</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Clear, Enter, Value } from '@serenity-js/playwright';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { chromium } from 'playwright';
 *
 *  actorCalled('Inés')
 *      .whoCan(BrowseTheWeb.using(chromium))
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
   * @param Answerable<ElementHandleAnswer>} field
   *  The field to be cleared
   * @returns {@serenity-js/core/lib/screenplay~Interaction}
   */
    static theValueOf(field: Answerable<ElementHandleAnswer>): Interaction {
        return new Clear(field);
    }

    /**
   * @param Answerable<ElementHandleAnswer>} field
   *  The field to be cleared
   */
    constructor(private readonly field: Answerable<ElementHandleAnswer>) {
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
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const value = await Value.of(this.field).answeredBy(actor);
        if (value === null) {
            throw new LogicError(
                `${this.capitaliseFirstLetter(
                    this.field.toString()
                )} doesn't seem to have a 'value' attribute that could be cleared.`
            );
        }

        if (value !== undefined) {
            const target = await actor.answer(this.field);
            return this.removeCharactersFrom(target);
        }
    }

    /**
   * @desc
   *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
   *
   * @returns {string}
   */
    toString(): string {
        return formatted`#actor clears the value of ${this.field}`;
    }

    private capitaliseFirstLetter(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    private removeCharactersFrom(element: ElementHandleAnswer): Promise<void> {
        return element.fill('');
    }
}
