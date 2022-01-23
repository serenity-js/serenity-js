import { Answerable, f, Question } from '@serenity-js/core';

import { ByCss } from './ByCss';
import { ByCssContainingText } from './ByCssContainingText';
import { ById } from './ById';
import { ByTagName } from './ByTagName';
import { ByXPath } from './ByXPath';

export class By {
    static css(selector: Answerable<string>): Question<Promise<ByCss>> {
        return Question.about(f`by css (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ByCss(bySelector);
        });
    }

    static cssContainingText(selector: Answerable<string>, text: Answerable<string>): Question<Promise<ByCssContainingText>> {
        return Question.about(f`by css (${selector}) containing text ${ text }`, async actor => {
            const bySelector = await actor.answer(selector);
            const textSelector = await actor.answer(text);
            return new ByCssContainingText(bySelector, textSelector);
        });
    }

    static id(selector: Answerable<string>): Question<Promise<ById>> {
        return Question.about(f`by id (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ById(bySelector);
        });
    }

    static tagName(selector: Answerable<string>): Question<Promise<ByTagName>> {
        return Question.about(f`by tag name (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ByTagName(bySelector);
        });
    }

    static xpath(selector: Answerable<string>): Question<Promise<ByXPath>> {
        return Question.about(f`by xpath (${selector})`, async actor => {
            const bySelector = await actor.answer(selector);
            return new ByXPath(bySelector);
        });
    }
}
