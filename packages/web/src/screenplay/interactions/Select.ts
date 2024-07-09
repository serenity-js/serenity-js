import { type Answerable, Interaction,the } from '@serenity-js/core';
import { asyncMap, commaSeparated } from '@serenity-js/core/lib/io';
import { stringified } from '@serenity-js/core/lib/io/stringified';

import type { PageElement } from '../models';
import { SelectOption } from '../models';

/**
 * Instructs an [actor](https://serenity-js.org/api/core/class/Actor/) who has the [ability](https://serenity-js.org/api/core/class/Ability/) to [`BrowseTheWeb`](https://serenity-js.org/api/web/class/BrowseTheWeb/)
 * to select an option from a [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select),
 * either by its display name, or by value.
 *
 * ## Learn more
 * - [`Selected`](https://serenity-js.org/api/web/class/Selected/)
 *
 * @group Activities
 */
export class Select {

    /**
     * Instantiates an [interaction](https://serenity-js.org/api/core/class/Interaction/)
     * that instructs the [actor](https://serenity-js.org/api/core/class/Actor/)
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
     * ```C
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
     * - [`Selected.valueOf`](https://serenity-js.org/api/web/class/Selected/#valueOf)
     * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
     *
     * @param value
     *  A value of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to select
     */
    static value(value: Answerable<string>): { from: (pageElement: Answerable<PageElement>) => Interaction } {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(the`#actor selects value ${ value } from ${ pageElement }`, async actor => {
                    const element       = await actor.answer(pageElement);
                    const desiredValue  = await actor.answer(value);

                    await element.selectOptions(SelectOption.withValue(desiredValue));
                }),
        };
    }

    /**
     * Instantiates an [interaction](https://serenity-js.org/api/core/class/Interaction/)
     * that instructs the [actor](https://serenity-js.org/api/core/class/Actor/)
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
     * - [`Selected.valuesOf`](https://serenity-js.org/api/web/class/Selected/#valuesOf)
     * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
     *
     * @param values
     *  Values of the [`option` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to select
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
     * Instantiates an [interaction](https://serenity-js.org/api/core/class/Interaction/)
     * that instructs the [actor](https://serenity-js.org/api/core/class/Actor/)
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
     * - [`Selected.optionIn`](https://serenity-js.org/api/web/class/Selected/#optionIn)
     * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
     *
     * @param value
     *  Text of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to select
     */
    static option(value: Answerable<string>): { from: (pageElement: Answerable<PageElement>) => Interaction } {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(the`#actor selects ${ value } from ${ pageElement }`, async actor => {
                    const element       = await actor.answer(pageElement);
                    const desiredLabel  = await actor.answer(value);

                    await element.selectOptions(SelectOption.withLabel(desiredLabel));
                }),
        };
    }

    /**
     * Instantiates an [interaction](https://serenity-js.org/api/core/class/Interaction/)
     * that instructs the [actor](https://serenity-js.org/api/core/class/Actor/)
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
     * - [`Selected.optionsIn`](https://serenity-js.org/api/web/class/Selected/#optionsIn)
     * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
     *
     * @param values
     *  Text of the [`option` elements  ](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the [`Actor`](https://serenity-js.org/api/core/class/Actor/) to select
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
