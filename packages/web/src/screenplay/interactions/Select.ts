import { Answerable, AnswersQuestions } from '@serenity-js/core';
import { commaSeparated, formatted } from '@serenity-js/core/lib/io';
import { inspected } from '@serenity-js/core/lib/io/inspected';
import { Interaction, UsesAbilities } from '@serenity-js/core/lib/screenplay';

import { by, PageElement, PageElementList } from '../models';
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
            from: (target: Answerable<PageElement>): Interaction =>
                new SelectValue(value, target)
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
            from: (target: Answerable<PageElement>): Interaction =>
                new SelectValues(values, target)
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
            from: (target: Answerable<PageElement>): Interaction =>
                new SelectOption(value, target)
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
            from: (target: Answerable<PageElement>): Interaction =>
                new SelectOptions(values, target)
        };
    }
}

/**
 * @package
 */
class SelectValue implements Interaction {

    constructor(
        private readonly value: Answerable<string>,
        private readonly target: Answerable<PageElement>
    ) {
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const value     = await actor.answer(this.value);
        const target    = await actor.answer(this.target);

        const option    = await target.locateChildElement(by.css(`option[value=${ value }]`));

        return option.click();
    }

    toString () {
        return formatted `#actor selects value ${ this.value } from ${ this.target }`;
    }
}

/**
 * @package
 */
class SelectValues implements Interaction {

    constructor(
        private readonly values: Array<Answerable<string[] | string>>,
        private readonly target: Answerable<PageElement>
    ) {
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {

        const target                    = await actor.answer(this.target);
        const options: PageElementList    = await target.locateAllChildElements(by.css('option'));

        const desiredValues = (await Promise.all(this.values.map(value => actor.answer(value)))).flat();

        const shouldSelect: boolean[] = await options.map(optionsToSelect(hasValueEqualOneOf(desiredValues)));

        return options.forEach((option, index) => {
            if (shouldSelect[index]) {
                return option.click()
            }
        });
    }

    toString () {
        return `#actor selects values ${ commaSeparated(this.values.flat(), inspected) } from ${ this.target }`;
    }
}

/**
 * @package
 */
class SelectOption implements Interaction {

    constructor(
        private readonly value: Answerable<string>,
        private readonly target: Answerable<PageElement>
    ) {
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        const value     = await actor.answer(this.value);
        const target    = await actor.answer(this.target);

        const option    = await target.locateChildElement(by.cssContainingText('option', value));

        return option.click();
    }

    toString () {
        return formatted `#actor selects ${ this.value } from ${ this.target }`;
    }
}

/**
 * @package
 */
class SelectOptions implements Interaction {

    constructor(
        private readonly values: Array<Answerable<string[] | string>>,
        private readonly target: Answerable<PageElement>
    ) {
    }

    async performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {

        const desiredOptions    = (await Promise.all(this.values.map(value => actor.answer(value)))).flat();
        const target            = await actor.answer(this.target);
        const options           = await target.locateAllChildElements(by.css('option'));

        const shouldSelect: boolean[] = await options.map(optionsToSelect(hasTextEqualOneOf(desiredOptions)));

        return options.forEach((option, index) => {
            if (shouldSelect[index]) {
                return option.click()
            }
        });
    }

    toString () {
        return `#actor selects ${ commaSeparated(this.values.flat(), inspected) } from ${ this.target }`;
    }
}

/** @package */
function hasValueEqualOneOf(desiredValues: string[]): (option: PageElement) => Promise<boolean> {
    return async (option: PageElement) => {

        const value = await option.getValue()

        return desiredValues.includes(value);
    }
}

/** @package */
function hasTextEqualOneOf(desiredValues: string[]): (option: PageElement) => Promise<boolean> {
    return async (option: PageElement) => {

        const value = await option.getText()

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
