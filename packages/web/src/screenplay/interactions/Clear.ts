import type { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { d, LogicError, the } from '@serenity-js/core';

import type { PageElement } from '../models';
import { PageElementInteraction } from './PageElementInteraction';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to clear the `value` of a [form `input` field](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).
 *
 * ## Example widget
 *
 * ```html
 * <form>
 *   <input type="text" name="example" id="example" />
 * </form>
 * ```
 *
 * ## Lean Page Object describing the widget
 *
 * ```ts
 * import { By, PageElement } from '@serenity-js/web'
 *
 * const Form = {
 *   exampleInput: () =>
 *     PageElement.located(By.id('example'))
 *      .describedAs('example input')
 * }
 * ```
 *
 * ## Clearing the value of an input field
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { Clear, Enter, Value } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Inés')
 *   .whoCan(BrowseTheWeb.using(browser))
 *   .attemptsTo(
 *     Enter.theValue('Hello world!').into(Form.exampleInput()),
 *     Ensure.that(Value.of(Form.exampleInput()), equals('Hello world!')),
 *
 *     Clear.theValueOf(Form.exampleInput()),
 *     Ensure.that(Value.of(Form.exampleInput()), equals('')),
 *   )
 * ```
 *
 * ## Learn more
 *
 * - [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * - [`Enter`](https://serenity-js.org/api/web/class/Enter/)
 * - [`Value`](https://serenity-js.org/api/web/class/Value/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 *
 * @group Activities
 */
export class Clear extends PageElementInteraction {

    /**
     * Instantiates an [interaction](https://serenity-js.org/api/core/class/Interaction/)
     * that instructs the [actor](https://serenity-js.org/api/core/class/Actor/)
     * to clear the value of an input `field`,
     *
     * @param field
     *  The field which value should be cleared
     */
    static theValueOf(field: Answerable<PageElement>): Interaction {
        return new Clear(field);
    }

    protected constructor(private readonly field: Answerable<PageElement>) {
        super(the`#actor clears the value of ${ field }`);
    }

    /**
     * @inheritDoc
     */
    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const element = await this.resolve(actor, this.field);

        const isClearable = await this.isClearable(element);

        if (!isClearable) {
            throw new LogicError(
                this.capitaliseFirstLetter(d`${ this.field } doesn't seem like an element that could be cleared.`),
            );
        }

        await element.clearValue();
    }

    private async isClearable(element: PageElement): Promise<boolean> {
        const contentEditable = await element.attribute('contenteditable');
        const hasContentEditableAttribute = contentEditable !== null && contentEditable !== undefined && contentEditable !== 'false';  // true or empty string mean content is editable

        if (hasContentEditableAttribute) {
            return true;
        }

        try {
            const value = await element.value();
            const hasValueAttribute = value !== null && value !== undefined;

            return hasValueAttribute;
        }
        catch {
            return false;
        }
    }

    private capitaliseFirstLetter(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
}
