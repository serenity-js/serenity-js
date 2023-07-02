import type { Answerable} from '@serenity-js/core';
import { d } from '@serenity-js/core';
import { asyncMap, commaSeparated } from '@serenity-js/core/lib/io';
import { stringified } from '@serenity-js/core/lib/io/stringified';
import { Interaction } from '@serenity-js/core/lib/screenplay';

import type { PageElement} from '../models';
import { SelectOption } from '../models';

/**
 * Instructs an {@apilink Actor|actor} who has the {@apilink Ability|ability} to {@apilink BrowseTheWeb}
 * to select an option from a [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select),
 * either by its display name, or by value.
 *
 * ## Learn more
 * - {@apilink Selected}
 *
 * @group Activities
 */
export class Select {

    /**
     * Instantiates an {@apilink Interaction|interaction}
     * that instructs the {@apilink Actor|actor}
     * to select a single [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     * with a given [`value`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#attr-value).,
     *
     * #### Example widget
     *
     * ```html
     * <select data-test='countries'>
     *   <option value='UK'>United Kingdom</option>
     *   <option value='PL'>Poland</option>
     *   <option value='US'>United States</option>
     * </select>
     * ```
     *
     * #### Lean Page Object describing the widget
     *
     * ```ts
     * import { By, PageElement } from '@serenity-js/web'
     *
     * class Countries {
     *   static dropdown = () =>
     *     PageElement.located(By.css('[data-test="countries"]'))
     *       .describedAs('countries dropdown')
     * }
     * ```
     *
     * #### Retrieving the selected value
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Select, Selected } from '@serenity-js/web';
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Nick')
     *   .attemptsTo(
     *     Select.value('UK').from(Countries.dropdown()),
     *     Ensure.that(Selected.valueOf(Countries.dropdown()), equals('UK')),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Selected.valueOf}
     * - {@apilink PageElement}
     *
     * @param value
     *  A value of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@apilink Actor} to select
     */
    static value(value: Answerable<string>): { from: (pageElement: Answerable<PageElement>) => Interaction } {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(d`#actor selects value ${ value } from ${ pageElement }`, async actor => {
                    const element       = await actor.answer(pageElement);
                    const desiredValue  = await actor.answer(value);

                    await element.selectOptions(SelectOption.withValue(desiredValue));
                }),
        };
    }

    /**
     * Instantiates an {@apilink Interaction|interaction}
     * that instructs the {@apilink Actor|actor}
     * to select multiple [`<option>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     * identified by their [`value`s](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#attr-value).
     *
     * #### Example widget
     *
     * ```ts
     * <select multiple data-test='countries'>
     *   <option value='UK'>United Kingdom</option>
     *   <option value='PL'>Poland</option>
     *   <option value='US'>United States</option>
     * </select>
     * ```
     *
     * #### Lean Page Object describing the widget
     *
     * ```ts
     * import { By, PageElement } from '@serenity-js/web'
     *
     * class Countries {
     *   static dropdown = () =>
     *     PageElement.located(By.css('[data-test="countries"]'))
     *       .describedAs('countries dropdown')
     * }
     * ```
     *
     * #### Retrieving the selected value
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Select, Selected } from '@serenity-js/web'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Nick')
     *   .attemptsTo(
     *     Select.values('UK').from(Countries.dropdown()),
     *     Ensure.that(Selected.valuesOf(Countries.dropdown()), equals([ 'UK' ])),
     *   )
     * ```
     *
     * #### Learn more
     *
     * - {@apilink Selected.valuesOf}
     * - {@apilink PageElement}
     *
     * @param values
     *  Values of the [`option` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@apilink Actor} to select
     */
    static values(...values: Array<Answerable<string[] | string>>): { from: (pageElement: Answerable<PageElement>) => Interaction } {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(`#actor selects values ${ commaSeparated(values.flat(), item => stringified(item, { inline: true })) } from ${ stringified(pageElement, { inline: true }) }`, async actor => {

                    const answers       = await asyncMap(values, value => actor.answer(value));
                    const desiredValues = answers.flat();

                    const element  = await actor.answer(pageElement);

                    await element.selectOptions(... desiredValues.map(value => SelectOption.withValue(value)));
                }),
        };
    }

    /**
     * Instantiates an {@apilink Interaction|interaction}
     * that instructs the {@apilink Actor|actor}
     * to select a single [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     * with a given description.
     *
     * #### Example widget
     *
     * ```html
     * <select data-test='countries'>
     *   <option value='UK'>United Kingdom</option>
     *   <option value='PL'>Poland</option>
     *   <option value='US'>United States</option>
     * </select>
     * ```
     *
     * #### Lean Page Object describing the widget
     * ```ts
     * import { By, PageElement } from '@serenity-js/by'
     *
     * class Countries {
     *   static dropdown = () =>
     *     PageElement.located(By.css('[data-test="countries"]'))
     *       .describedAs('countries dropdown')
     * }
     * ```
     *
     * #### Retrieving the selected value
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Select, Selected } from '@serenity-js/web'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Nick')
     *   .whoCan(BrowseTheWeb.using(protractor.browser))
     *   .attemptsTo(
     *     Select.option('Poland').from(Countries.dropdown()),
     *     Ensure.that(
     *       Selected.optionIn(Countries.dropdown()),
     *       equals('Poland')
     *     ),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Selected.optionIn}
     * - {@apilink PageElement}
     *
     * @param value
     *  Text of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@apilink Actor} to select
     */
    static option(value: Answerable<string>): { from: (pageElement: Answerable<PageElement>) => Interaction } {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(d`#actor selects ${ value } from ${ pageElement }`, async actor => {
                    const element       = await actor.answer(pageElement);
                    const desiredLabel  = await actor.answer(value);

                    await element.selectOptions(SelectOption.withLabel(desiredLabel));
                }),
        };
    }

    /**
     * Instantiates an {@apilink Interaction|interaction}
     * that instructs the {@apilink Actor|actor}
     * to select multiple [`<option>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     * identified by their descriptions.
     *
     * #### Example widget
     *
     * ```html
     * <select multiple data-test='countries'>
     *   <option value='UK'>United Kingdom</option>
     *   <option value='PL'>Poland</option>
     *   <option value='US'>United States</option>
     * </select>
     * ```
     *
     * #### Lean Page Object describing the widget
     *
     * ```ts
     * import { By, PageElement } from '@serenity-js/web'
     *
     * class Countries {
     *   static dropdown = () =>
     *     PageElement.located(By.css('[data-test="countries"]'))
     *       .describedAs('countries dropdown')
     * }
     * ```
     *
     * ##### Retrieving the selected value
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Select, Selected } from '@serenity-js/web'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Nick')
     *   .whoCan(BrowseTheWeb.using(protractor.browser))
     *   .attemptsTo(
     *     Select.options('Poland', 'United States').from(Countries.dropdown()),
     *     Ensure.that(
     *       Selected.optionsIn(Countries.dropdown()),
     *       equals([ 'Poland', 'United States' ])
     *     ),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Selected.optionsIn}
     * - {@apilink PageElement}
     *
     * @param values
     *  Text of the [`option` elements  ](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@apilink Actor} to select
     */
    static options(...values: Array<Answerable<string[] | string>>): { from: (pageElement: Answerable<PageElement>) => Interaction } {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(`#actor selects ${ commaSeparated(values.flat(), item => stringified(item, { inline: true })) } from ${ stringified(pageElement, { inline: true }) }`, async actor => {

                    const answers       = await asyncMap(values, value => actor.answer(value));
                    const desiredLabels = answers.flat();

                    const element  = await actor.answer(pageElement);

                    await element.selectOptions(... desiredLabels.map(label => SelectOption.withLabel(label)));
                }),
        };
    }
}
