import { Answerable, Model, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

export abstract class Page {
    static current(): Question<Promise<Page>> & Model<Page> {
        return Question.about<Promise<Page>>('current page', actor => {
            return BrowseTheWeb.as(actor).currentPage();
        });
    }

    static called(windowNameOrHandle: Answerable<string>): Question<Promise<Page>> & Model<Page> {
        return Question.about<Promise<Page>>(`page called "${ windowNameOrHandle }"`, async actor => {
            const nameOrHandle = await actor.answer(windowNameOrHandle);
            return BrowseTheWeb.as(actor).pageCalled(nameOrHandle)
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
