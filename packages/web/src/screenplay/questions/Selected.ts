import { Answerable, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { By, PageElement, PageElements } from '../models';
import { Text } from './Text';
import { Value } from './Value';

/**
 * @desc
 *  Represents options and values selected in a
 *  [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
 *
 * @see {@link Select}
 */
export class Selected {

    /**
     * @desc
     *  Represents the value of a single option selected in a
     *  [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
     *
     * @example <caption>Example widget</caption>
     *  <select data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object</caption>
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
     *  import { Accept, BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
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
     * @param {Answerable<PageElement>} pageElement
     *  A {@link PageElement} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string>>}
     *
     * @see {@link Select.value}
     */
    static valueOf(pageElement: Answerable<PageElement>): Question<Promise<string>> {
        return PageElement.located(By.css('option:checked'))
            .of(pageElement)
            .value()
            .describedAs(formatted `value selected in ${ pageElement }`);
    }

    /**
     * @desc
     *  Represents values of options selected in a
     *  [HTML `<select multiple>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
     *
     * @example <caption>Example widget</caption>
     *  <select multiple data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object</caption>
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
     *  import { Accept, BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
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
     * @param {Answerable<PageElement>} pageElement
     *  A {@link Target} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Select.values}
     */
    static valuesOf(pageElement: Answerable<PageElement>): Question<Promise<string[]>> {
        return PageElements.located(By.css('option:checked'))
            .of(pageElement)
            .eachMappedTo(Value)
            .describedAs(formatted `values selected in ${ pageElement }`) as Question<Promise<string[]>>;
    }

    /**
     * @desc
     *  Represents a single option selected in a
     *  [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
     *
     * @example <caption>Example widget</caption>
     *  <select data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object</caption>
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
     *  import { Accept, BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
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
     * @param {Answerable<PageElement>} pageElement
     *  A {@link Target} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string>>}
     *
     * @see {@link Select.option}
     */
    static optionIn(pageElement: Answerable<PageElement>): Question<Promise<string>> {
        return PageElement.located(By.css('option:checked'))
            .of(pageElement)
            .text()
            .describedAs(formatted `option selected in ${ pageElement }`);
    }

    /**
     * @desc
     *  Represents options selected in a
     *  [HTML `<select multiple>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
     *
     * @example <caption>Example widget</caption>
     *  <select multiple data-test='countries'>
     *      <option value='UK'>United Kingdom</option>
     *      <option value='PL'>Poland</option>
     *      <option value='US'>United States</option>
     *  </select>
     *
     * @example <caption>Lean Page Object</caption>
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
     *  import { Accept, BrowseTheWeb, Select, Selected } from '@serenity-js/protractor';
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
     * @param {Answerable<PageElement>} pageElement
     *  A {@link Target} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Select.options}
     */
    static optionsIn(pageElement: Answerable<PageElement>): Question<Promise<string[]>> {
        return PageElements.located(By.css('option:checked'))
            .of(pageElement)
            .eachMappedTo(Text)
            .describedAs(formatted `options selected in ${ pageElement }`) as Question<Promise<string[]>>;
    }
}
