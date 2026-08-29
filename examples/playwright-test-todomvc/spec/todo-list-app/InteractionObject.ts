import type { Answerable, Optional, QuestionAdapter } from '@serenity-js/core';
import { PageElement, PageElements, type Selector } from '@serenity-js/web';

export class InteractionObject implements Optional {

    constructor(
        protected readonly rootElement: Answerable<PageElement>,
    ) {
    }

    isPresent(): Answerable<boolean> {
        return (this.rootElement as QuestionAdapter<PageElement>).isPresent();
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
