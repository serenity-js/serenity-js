import type { Answerable, Optional } from '@serenity-js/core';
import { PageElement, type PageElementAdapter } from '@serenity-js/web';

export class InteractionObject implements Optional {

    protected readonly rootElement: PageElementAdapter<unknown>;

    constructor(rootElement: Answerable<PageElement>) {
        this.rootElement = PageElement.createAdapter(rootElement);
    }

    isPresent(): Answerable<boolean> {
        return this.rootElement.isPresent();
    }
}
