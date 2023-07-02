import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { d, Question } from '@serenity-js/core';

import type { PageElement } from '../models';

/**
 * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
 * options and values selected in a
 * [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
 *
 * ## Learn more
 * - {@apilink Select}
 * - {@apilink BrowseTheWeb}
 * - {@apilink QuestionAdapter}
 * - {@apilink Question}
 *
 * @group Questions
 */
export class Selected {

    /**
     * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * a single [option](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     * selected in an [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select).
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
     *       .describedAs('countries dropdown');
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
     *     Select.value('UK').from(Countries.dropdown),
     *     Ensure.that(Selected.valueOf(Countries.dropdown), equals('UK')),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Select.value}
     *
     * @param pageElement
     *  A {@apilink PageElement} identifying the `<select>` element of interest
     */
    static valueOf(pageElement: Answerable<PageElement>): QuestionAdapter<string> {
        return Question.about(d`value selected in ${ pageElement }`, async actor => {
            const element = await actor.answer(pageElement);
            const options = await element.selectedOptions();

            return options
                .filter(option => option.selected)
                .map(option => option.value)[0];
        });
    }

    /**
     * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * values of [options](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)
     * selected in an [HTML `<select multiple>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
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
     *     Select.values('UK').from(Countries.dropdown),
     *     Ensure.that(Selected.valuesOf(Countries.dropdown), equals([ 'UK' ])),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Select.values}
     *
     * @param pageElement
     *  A {@apilink PageElement} identifying the `<select>` element of interest
     */
    static valuesOf(pageElement: Answerable<PageElement>): QuestionAdapter<Array<string>> {
        return Question.about(d`values selected in ${ pageElement }`, async actor => {
            const element = await actor.answer(pageElement);

            const options = await element.selectedOptions();

            return options
                .filter(option => option.selected)
                .map(option => option.value);
        });
    }

    /**
     * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * a single option selected in an [HTML `<select>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
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
     * #### Retrieving the selected value
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Select, Selected } from '@serenity-js/web'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Nick')
     *   .attemptsTo(
     *     Select.option('Poland').from(Countries.dropdown),
     *     Ensure.that(
     *       Selected.optionIn(Countries.dropdown),
     *       equals('Poland')
     *     ),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Select.option}
     *
     * @param pageElement
     *  A {@apilink PageElement} identifying the `<select>` element of interest
     */
    static optionIn(pageElement: Answerable<PageElement>): QuestionAdapter<string> {
        return Question.about(d`option selected in ${ pageElement }`, async actor => {
            const element = await actor.answer(pageElement);

            const options = await element.selectedOptions();

            return options
                .filter(option => option.selected)
                .map(option => option.label)[0];
        });
    }

    /**
     * Uses the {@apilink Actor|actor's} {@apilink Ability|ability} to {@apilink BrowseTheWeb} to retrieve
     * options selected in an [HTML `<select multiple>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select#attr-multiple)
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
     * #### Retrieving the selected value
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { Select, Selected } from '@serenity-js/web'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Nick')
     *   .attemptsTo(
     *     Select.options('Poland', 'United States').from(Countries.dropdown),
     *     Ensure.that(
     *       Selected.optionsIn(Countries.dropdown),
     *       equals([ 'Poland', 'United States' ])
     *     ),
     *   )
     * ```
     *
     * #### Learn more
     * - {@apilink Select.options}
     *
     * @param pageElement
     *  A {@apilink PageElement} identifying the `<select>` element of interest
     */
    static optionsIn(pageElement: Answerable<PageElement>): QuestionAdapter<Array<string>> {
        return Question.about(d`options selected in ${ pageElement }`, async actor => {
            const element = await actor.answer(pageElement);

            const options = await element.selectedOptions();

            return options
                .filter(option => option.selected)
                .map(option => option.label);
        });
    }
}
