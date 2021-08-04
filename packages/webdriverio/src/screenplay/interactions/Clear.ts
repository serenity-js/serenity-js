import { Answerable, AnswersQuestions, Interaction, LogicError, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { Element } from 'webdriverio';

import { WebElementInteraction } from './WebElementInteraction';

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
 *  import { by, Target } from '@serenity-js/webdriverio';
 *
 *  class Form {
 *      static exampleInput = Target.the('example input')
 *          .located(by.id('example'));
 *  }
 *
 * @example <caption>Clearing the value of an input field</caption>
 *  import { actorCalled } from '@serenity-js/core';
 *  import { BrowseTheWeb, Clear, Enter, Value } from '@serenity-js/webdriverio';
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  actorCalled('Inés')
 *      .whoCan(BrowseTheWeb.using(browser))
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
export class Clear extends WebElementInteraction {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {Answerable<Element<'async'>>} field
     *  The field to be cleared
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static theValueOf(field: Answerable<Element<'async'>>): Interaction {
        return new Clear(field);
    }

    /**
     * @param {Answerable<Element<'async'>>} field
     *  The element to be clicked on
     */
    constructor(private readonly field: Answerable<Element<'async'>>) {
        super(formatted `#actor clears the value of ${ field }`);
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
        const element   = await this.resolve(actor, this.field);
        const value     = await element.getValue();

        if (value === undefined) {
            throw new LogicError(
                this.capitaliseFirstLetter(formatted `${ this.field } doesn't seem to have a 'value' attribute that could be cleared.`),
            );
        }

        return element.clearValue();
    }

    private capitaliseFirstLetter(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
