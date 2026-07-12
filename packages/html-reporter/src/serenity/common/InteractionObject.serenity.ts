import type { Answerable, QuestionAdapter } from '@serenity-js/core';
import { PageElement, PageElements, type Selector } from '@serenity-js/web';

export class InteractionObject<NET> {
    constructor(protected readonly rootElement: PageElement<NET> | QuestionAdapter<PageElement<NET>>) {
    }

    protected child(selector: Answerable<Selector>): QuestionAdapter<PageElement> {
        return PageElement
            .located(selector)
            .of(this.rootElement);
    }

    protected children(selector: Answerable<Selector>): ReturnType<typeof PageElements.located> {
        return PageElements
            .located(selector)
            .of(this.rootElement);
    }
}
