import { Answerable, Model, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../screenplay';

export abstract class Page {
    static current(): Question<Promise<Page>> & Model<Page> {
        return Question.about('current page', actor => {
            return BrowseTheWeb.as(actor).getCurrentPage()
        });
    }

    static called(windowNameOrHandle: Answerable<string>): Question<Promise<Page>> {
        return Question.about(`page called "${ windowNameOrHandle }"`, async actor => {
            const nameOrHandle = await actor.answer(windowNameOrHandle);
            return BrowseTheWeb.as(actor).getPageCalled(nameOrHandle)
        });
    }

    constructor(
        public readonly handle: string,
    ) {
    }

    abstract title(): Promise<string>;

    abstract viewportSize(): Promise<{ width: number, height: number }>;
    abstract setViewportSize(size: { width: number, height: number }): Promise<void>;

    // close(): Promise<void>;

    // toString() {
    //
    //     return `page handle ${ this.handle }`;
    // }
}
