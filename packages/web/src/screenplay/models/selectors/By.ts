import type { Answerable} from '@serenity-js/core';
import { f, Question } from '@serenity-js/core';

import { ByCss } from './ByCss';
import { ByCssContainingText } from './ByCssContainingText';
import { ByDeepCss } from './ByDeepCss';
import { ById } from './ById';
import { ByTagName } from './ByTagName';
import { ByXPath } from './ByXPath';

/**
 * `By` produces a [`Selector`](https://serenity-js.org/api/web/class/Selector/) used to locate a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) or [`PageElement`](https://serenity-js.org/api/web/class/PageElements/) on a web page.
 * Selectors can be defined using a static value or a [`Question`](https://serenity-js.org/api/core/class/Question/) to be resolved at runtime.
 *
 * ### Defining a selector using a static value
 *
 * ```typescript
 * import { PageElement, By } from '@serenity-js/web'
 *
 * class LoginForm {
 *   static usernameField = () =>
 *     PageElement.located(By.id('username'))              // locate element by its id
 *       .describedAs('username field')
 *
 *   static passwordField = () =>
 *     PageElement.located(By.css('[data-test="password"]'))    // locate element using a CSS selector
 *       .describedAs('password field')
 * }
 * ```
 *
 * ### Defining a selector using a Question
 *
 * Each method on this class accepts an [`Answerable`](https://serenity-js.org/api/core/#Answerable) to allow for dynamic resolution of the selector.
 * This can be useful when the selector is not known at the time of writing the test, or when the selector
 * needs to be calculated based on the state of the system under test.
 *
 * The example below demonstrates how to use [`q`](https://serenity-js.org/api/core/function/q/) to define a selector that includes a dynamic value.
 *
 * ```typescript
 * import { q } from '@serenity-js/core'
 * import { PageElement, By } from '@serenity-js/web'
 *
 * class FormField {
 *   static withTestId = (id: Answerable<string>) =>
 *     PageElement.located(By.css(q`input[data-test-id="${ id }"]`))
 *       .describedAs('form field')
 * }
 *
 * ```
 *
 * ### Learn more
 * - [Page Element Query Language](https://serenity-js.org/handbook/web-testing/page-element-query-language)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElement/)
 * - [`PageElement`](https://serenity-js.org/api/web/class/PageElements/)
 * - [`q`](https://serenity-js.org/api/core/function/q/)
 *
 * @group Models
 */
export class By {

    /**
     * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
     *
     * @param selector
     */
    static css(selector: Answerable<string>): Question<Promise<ByCss>> {
        return Question.about(f`by css (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ByCss(bySelector);
        });
    }

    /**
     * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) with a given [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText)
     * using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
     *
     * @param selector
     * @param text
     */
    static cssContainingText(selector: Answerable<string>, text: Answerable<string>): Question<Promise<ByCssContainingText>> {
        return Question.about(f`by css (${selector}) containing text ${ text }`, async actor => {
            const bySelector = await actor.answer(selector);
            const textSelector = await actor.answer(text);
            return new ByCssContainingText(bySelector, textSelector);
        });
    }

    /**
     * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors)
     * capable of piercing [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)-piercing
     *
     * @param selector
     */
    static deepCss(selector: Answerable<string>): Question<Promise<ByCss>> {
        return Question.about(f`by deep css (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ByDeepCss(bySelector);
        });
    }

    /**
     * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using its [id](https://developer.mozilla.org/en-US/docs/Web/CSS/ID_selectors).
     *
     * @param selector
     */
    static id(selector: Answerable<string>): Question<Promise<ById>> {
        return Question.about(f`by id (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ById(bySelector);
        });
    }

    /**
     * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using the name of its [HTML tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element).
     *
     * @param selector
     */
    static tagName(selector: Answerable<string>): Question<Promise<ByTagName>> {
        return Question.about(f`by tag name (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ByTagName(bySelector);
        });
    }

    /**
     * Locates a [`PageElement`](https://serenity-js.org/api/web/class/PageElement/) using an [XPath selector](https://developer.mozilla.org/en-US/docs/Web/XPath).
     *
     * @param selector
     */
    static xpath(selector: Answerable<string>): Question<Promise<ByXPath>> {
        return Question.about(f`by xpath (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ByXPath(bySelector);
        });
    }
}
