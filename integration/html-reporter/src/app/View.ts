import { Answerable, QuestionAdapter } from '@serenity-js/core';
import { PageElement, PageElements, type Selector } from '@serenity-js/web';

export class View<NET> {
    constructor(private readonly rootElement: Answerable<PageElement<NET>>) {
    }

    protected child(selector: Answerable<Selector>): QuestionAdapter<PageElement> {
        return PageElement
            .located(selector)
            .of(this.rootElement)
    }

    protected children(selector: Answerable<Selector>) {
        return PageElements
            .located(selector)
            .of(this.rootElement)
    }
}
