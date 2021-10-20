import { Answerable, ProxyAnswer, Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../screenplay';

export abstract class Page {
    static current(): Question<Promise<Page>> & ProxyAnswer<Page> {
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

    // close(): Promise<void>;

    // toString() {
    //
    //     return `page handle ${ this.handle }`;
    // }
}
