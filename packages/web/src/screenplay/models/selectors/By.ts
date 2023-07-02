import type { Answerable} from '@serenity-js/core';
import { f, Question } from '@serenity-js/core';

import { ByCss } from './ByCss';
import { ByCssContainingText } from './ByCssContainingText';
import { ByDeepCss } from './ByDeepCss';
import { ById } from './ById';
import { ByTagName } from './ByTagName';
import { ByXPath } from './ByXPath';

/**
 * @group Models
 */
export class By {

    /**
     * Locates a {@apilink PageElement} using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
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
     * Locates a {@apilink PageElement} with a given [`innerText`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText)
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
     * Locates a {@apilink PageElement} using a [CSS selector](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors)
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
     * Locates a {@apilink PageElement} using its [id](https://developer.mozilla.org/en-US/docs/Web/CSS/ID_selectors).
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
     * Locates a {@apilink PageElement} using the name of its [HTML tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Element).
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
     * Locates a {@apilink PageElement} using an [XPath selector](https://developer.mozilla.org/en-US/docs/Web/XPath).
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
