import type { Answerable } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';

export class ResultCount<NET> {

    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    text = (): Question<Promise<string>> =>
        Question.about('result count text', async actor => {
            const element = await actor.answer(this.rootElement);
            return (await element.text()).trim();
        });
}
