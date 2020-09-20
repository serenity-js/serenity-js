import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ElementFinder } from 'protractor';
import { promiseOf } from '../../promiseOf';
import { withAnswerOf } from '../withAnswerOf';

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
     * @param {Question<ElementFinder> | ElementFinder} target
     *  A {@link Target} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string>>}
     *
     * @see {@link Select.value}
     */
    static valueOf(target: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new SelectedValue(target);
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
     * @param {Question<ElementFinder> | ElementFinder} target
     *  A {@link Target} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Select.values}
     */
    static valuesOf(target: Question<ElementFinder> | ElementFinder): Question<Promise<string[]>> {
        return new SelectedValues(target);
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
     * @param {Question<ElementFinder> | ElementFinder} target
     *  A {@link Target} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string>>}
     *
     * @see {@link Select.option}
     */
    static optionIn(target: Question<ElementFinder> | ElementFinder): Question<Promise<string>> {
        return new SelectedOption(target);
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
     * @param {Question<ElementFinder> | ElementFinder} target
     *  A {@link Target} identifying the `<select>` element of interest
     *
     * @returns {Question<Promise<string[]>>}
     *
     * @see {@link Select.options}
     */
    static optionsIn(target: Question<ElementFinder> | ElementFinder): Question<Promise<string[]>> {
        return new SelectedOptions(target);
    }
}

/**
 * @package
 */
class SelectedValue extends Question<Promise<string>> {

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super(formatted `value selected in ${ target }`);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        const value = withAnswerOf(actor, this.target, (element: ElementFinder) =>
            element.$('option:checked').getAttribute('value')
        );

        return promiseOf(value);
    }
}

/**
 * @package
 */
class SelectedValues extends Question<Promise<string[]>> {

    constructor(private readonly target: Question<ElementFinder> | ElementFinder) {
        super(formatted `values selected in ${ target }`);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        const options = withAnswerOf(actor, this.target, (element: ElementFinder) => element.$$('option')
            .filter(option => option.isSelected()));

        return promiseOf(options.map(option => option.getAttribute('value')));
    }
}

/**
 * @package
 */
class SelectedOption extends Question<Promise<string>> {

    constructor(private target: Question<ElementFinder> | ElementFinder) {
        super(formatted `option selected in ${ target }`);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string> {
        return promiseOf(withAnswerOf(actor, this.target, element => element.$('option:checked').getText()));
    }
}

/**
 * @package
 */
class SelectedOptions extends Question<Promise<string[]>> {

    constructor(private target: Question<ElementFinder> | ElementFinder) {
        super(formatted `options selected in ${ target }`);
    }

    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<string[]> {
        return promiseOf(withAnswerOf(actor, this.target, element => element.$$('option')
            .filter(option => option.isSelected())
            .map(elements => elements.getText())));
    }
}
