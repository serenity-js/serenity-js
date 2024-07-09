import type { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { Question, the } from '@serenity-js/core';
import { asyncMap } from '@serenity-js/core/lib/io';

import type { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to enter a value into a [form `input`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) field.
 *
 * ## Example widget
 * ```html
 * <form>
 *  <input type="text" name="example" id="example" />
 * </form>
 * ```
 *
 * ## Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/web'
 *
 * class Form {
 *   static exampleInput = () =>
 *     PageElement.located(By.id('example'))
 *       .describedAs('example input')
 *  }
 * ```
 *
 * ## Entering the value into a form field
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core';
 * import { Enter } from '@serenity-js/web';
 *
 * await actorCalled('Esme')
 *   .attemptsTo(
 *     Enter.theValue('Hello world!').into(Form.exampleInput()),
 *   )
 * ```
 *
 * ## Handling sensitive information
 *
 * By design, any data handled by an actor appears in Serenity/JS reports.
 * To prevent the exposure of any sensitive information, such as passwords or tokens, you should use [`Masked`](https://serenity-js.org/api/core/class/Masked/).
 * 
 * ```ts
 * import { actorCalled, Masked } from '@serenity-js/core'
 * import { Enter } from '@serenity-js/web'
 *
 * await actorCalled('Esme')
 *   .attemptsTo(
 *     Enter.theValue(Masked.valueOf('your little secret').into(Form.exampleInputField()),
 *   )
 *
 *   // Gets reported as: "Esme enters [a masked value] into the example input field"
 * ```
 * 
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * @group Activities
 */
export class Enter extends PageElementInteraction {

    /**
     * Instantiates this [`Interaction`](https://serenity-js.org/api/core/class/Interaction/).
     *
     * @param values
     *  The text value to be entered
     */
    static theValue(...values: Array<Answerable<string | number | string[] | number[]>>): { into: (field: Answerable<PageElement>) => Interaction } {
        return {
            into: (field: Answerable<PageElement>  /* todo Question<AlertPromise> | AlertPromise */) =>
                new Enter(values, field),
        };
    }

    protected constructor(
        private readonly values: Array<Answerable<string | number | string[] | number[]>>,
        private readonly field: Answerable<PageElement> /* todo | Question<AlertPromise> | AlertPromise */,
    ) {
        super(
            values.length === 1
                ? the `#actor enters ${ values[0] } into ${ field }`
                : the `#actor enters ${ Question.fromArray(values) } into ${ field }`
        );
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const field  = await this.resolve(actor, this.field);

        const valuesToEnter = await asyncMap(this.values, value => actor.answer(value))

        return field.enterValue(valuesToEnter.flat());
    }
}
