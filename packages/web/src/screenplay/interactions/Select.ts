import { Answerable, q } from '@serenity-js/core';
import { asyncMap, commaSeparated, formatted } from '@serenity-js/core/lib/io';
import { inspected } from '@serenity-js/core/lib/io/inspected';
import { Interaction } from '@serenity-js/core/lib/screenplay';

import { By, PageElement, PageElements } from '../models';
import { SelectBuilder } from './SelectBuilder';

/**
 * @desc
 *  Instructs the {@link @serenity-js/core/lib/screenplay/actor~Actor} to
 *  select an option from a [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select),
 *  either by its display name, or by value.
 *
 * @see {@link Selected}
 */
export class Select {

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
     *  with a [`value`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#attr-value)
     *  of a single [`<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
     *
     * @example <caption>Example widget</caption>
     *  <select data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object describing the widget</caption>
     *  import { Target } from '@serenity-js/protractor';
     *  import { browser, by } from 'protractor';
     *
     *  class Countries {
     *      static dropdown = Target.the('countries dropdown')
     *          .located(by.css('[data-test="countries"]'));
     *  }
     *
     * @example <caption>Retrieving the selected value</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *  import { protractor } from 'protractor';
     *
     *  actorCalled('Nick')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Select.value('UK').from(Countries.dropdown),
     *          Ensure.that(Selected.valueOf(Countries.dropdown), equals('UK')),
     *      );
     *
     * @param {Answerable<string>} value
     *  A value of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
     *
     * @returns {SelectBuilder}
     *
     * @see {@link Selected.valueOf}
     * @see {@link BrowseTheWeb}
     * @see {@link Target}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~equals}
     */
    static value(value: Answerable<string>): SelectBuilder {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(formatted `#actor selects value ${ value } from ${ pageElement }`, async actor => {
                    return PageElement.located(By.css(q`option[value=${ value }]`))
                        .of(pageElement)
                        .click()
                        .performAs(actor);
                }),
        };
    }

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
     *  with [`value`s](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option#attr-value)
     *  of multiple [`<option>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
     *
     * @example <caption>Example widget</caption>
     *  <select multiple data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object describing the widget</caption>
     *  import { Target } from '@serenity-js/protractor';
     *  import { browser, by } from 'protractor';
     *
     *  class Countries {
     *      static dropdown = Target.the('countries dropdown')
     *          .located(by.css('[data-test="countries"]'));
     *  }
     *
     * @example <caption>Retrieving the selected value</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *  import { protractor } from 'protractor';
     *
     *  actorCalled('Nick')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Select.values('UK').from(Countries.dropdown),
     *          Ensure.that(Selected.valuesOf(Countries.dropdown), equals([ 'UK' ])),
     *      );
     *
     * @param {Array<Answerable<string[] | string>>} values
     *  Values of the [`option` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
     *
     * @returns {SelectBuilder}
     *
     * @see {@link Selected.valuesOf}
     * @see {@link BrowseTheWeb}
     * @see {@link Target}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~equals}
     */
    static values(...values: Array<Answerable<string[] | string>>): SelectBuilder {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(`#actor selects values ${ commaSeparated(values.flat(), item => inspected(item, { inline: true })) } from ${ inspected(pageElement, { inline: true }) }`, async actor => {

                    const answers = await asyncMap(values, value => actor.answer(value));
                    const desiredValues = answers.flat();

                    const options: PageElement[] = await PageElements.located(By.css(`option`))
                        .of(pageElement)
                        .answeredBy(actor);

                    for (const option of options) {
                        const shouldSelect = await optionsToSelect(hasValueEqualOneOf(desiredValues))(option);
                        if (shouldSelect) {
                            await option.click();
                        }
                    }
                }),
        };
    }

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
     *  with a single [`option`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
     *
     * @example <caption>Example widget</caption>
     *  <select data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object describing the widget</caption>
     *  import { Target } from '@serenity-js/protractor';
     *  import { browser, by } from 'protractor';
     *
     *  class Countries {
     *      static dropdown = Target.the('countries dropdown')
     *          .located(by.css('[data-test="countries"]'));
     *  }
     *
     * @example <caption>Retrieving the selected value</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *  import { protractor } from 'protractor';
     *
     *  actorCalled('Nick')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Select.option('Poland').from(Countries.dropdown),
     *          Ensure.that(
     *              Selected.optionIn(Countries.dropdown),
     *              equals('Poland')
     *          ),
     *      );
     *
     * @param {Answerable<string>} value
     *  Text of the [`option` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
     *
     * @returns {SelectBuilder}
     *
     * @see {@link Selected.optionIn}
     * @see {@link BrowseTheWeb}
     * @see {@link Target}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~equals}
     */
    static option(value: Answerable<string>): SelectBuilder {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(formatted `#actor selects ${ value } from ${ pageElement }`, async actor => {
                    return PageElement.located(By.cssContainingText('option', value))
                        .of(pageElement)
                        .click()
                        .performAs(actor);
                }),
        };
    }

    /**
     * @desc
     *  Instantiates this {@link @serenity-js/core/lib/screenplay~Interaction}
     *  with [`option`s](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select.
     *
     * @example <caption>Example widget</caption>
     *  <select multiple data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object describing the widget</caption>
     *  import { Target } from '@serenity-js/protractor';
     *  import { browser, by } from 'protractor';
     *
     *  class Countries {
     *      static dropdown = Target.the('countries dropdown')
     *          .located(by.css('[data-test="countries"]'));
     *  }
     *
     * @example <caption>Retrieving the selected value</caption>
     *  import { actorCalled } from '@serenity-js/core';
     *  import { BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
     *  import { Ensure, equals } from '@serenity-js/assertions';
     *  import { protractor } from 'protractor';
     *
     *  actorCalled('Nick')
     *      .whoCan(BrowseTheWeb.using(protractor.browser))
     *      .attemptsTo(
     *          Select.options('Poland', 'United States').from(Countries.dropdown),
     *          Ensure.that(
     *              Selected.optionsIn(Countries.dropdown),
     *              equals([ 'Poland', 'United States' ])
     *          ),
     *      );
     *
     * @param {Array<Answerable<string[] | string>>} values
     *  Text of the [`option` elements  ](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     *  for the {@link @serenity-js/core/lib/screenplay/actor~Actor} to select
     *
     * @returns {SelectBuilder}
     *
     * @see {@link Selected.optionsIn}
     * @see {@link BrowseTheWeb}
     * @see {@link Target}
     * @see {@link @serenity-js/assertions~Ensure}
     * @see {@link @serenity-js/assertions/lib/expectations~equals}
     */
    static options(...values: Array<Answerable<string[] | string>>): SelectBuilder {
        return {
            from: (pageElement: Answerable<PageElement>): Interaction =>
                Interaction.where(`#actor selects ${ commaSeparated(values.flat(), item => inspected(item, { inline: true })) } from ${ inspected(pageElement, { inline: true }) }`, async actor => {

                    const answers = await asyncMap(values, value => actor.answer(value));
                    const desiredOptions = answers.flat();

                    const options: PageElement[]    = await PageElements.located(By.css(`option`)).of(pageElement).answeredBy(actor);

                    for (const option of options) {
                        const shouldSelect = await optionsToSelect(hasTextEqualOneOf(desiredOptions))(option);
                        if (shouldSelect) {
                            await option.click()
                        }
                    }
                }),
        };
    }
}

/** @package */
function hasValueEqualOneOf(desiredValues: string[]): (option: PageElement) => Promise<boolean> {
    return async (option: PageElement) => {

        const value = await option.value()

        return desiredValues.includes(value);
    }
}

/** @package */
function hasTextEqualOneOf(desiredValues: string[]): (option: PageElement) => Promise<boolean> {
    return async (option: PageElement) => {

        const value = await option.text()

        return desiredValues.includes(value);
    }
}

/** @package */
function optionsToSelect(criterion: (option: PageElement) => Promise<boolean>) {
    return (option: PageElement) =>
        isAlreadySelected(option)
            .then(alreadySelected =>
                criterion(option).then(criterionMet =>
                    xor(alreadySelected, criterionMet)
                )
            );
}

/** @package */
function isAlreadySelected(option: PageElement): Promise<boolean> {
    return option.isSelected();
}

/** @package */
function xor(first: boolean, second: boolean): boolean {
    return first !== second;
}
