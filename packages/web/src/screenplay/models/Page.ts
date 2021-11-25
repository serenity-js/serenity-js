import { Adapter, Answerable, Question } from '@serenity-js/core';
import { URL } from 'url';

import { BrowseTheWeb } from '../abilities';

export abstract class Page {
    static current(): Question<Promise<Page>> & Adapter<Page> {
        return Question.about<Promise<Page>>('current page', actor => {
            return BrowseTheWeb.as(actor).currentPage();
        });
    }

    static called(windowNameOrHandle: Answerable<string>): Question<Promise<Page>> & Adapter<Page> {
        return Question.about<Promise<Page>>(`page called "${ windowNameOrHandle }"`, async actor => {
            const nameOrHandle = await actor.answer(windowNameOrHandle);
            return BrowseTheWeb.as(actor).pageCalled(nameOrHandle)
        });
    }

    constructor(
        public readonly handle: string,
    ) {
    }

    /**
     * @desc
     *  Retrieves the document title of the current top-level browsing context, equivalent to calling `document.title`.
     *
     * @returns {Promise<string>}
     */
    abstract title(): Promise<string>;

    /**
     * @desc
     *  Retrieves the URL of the current top-level browsing context.
     *
     * @returns {Promise<URL>}
     */
    abstract url(): Promise<URL>;

    abstract viewportSize(): Promise<{ width: number, height: number }>;
    abstract setViewportSize(size: { width: number, height: number }): Promise<void>;

    // close(): Promise<void>;

    // toString() {
    //
    //     return `page handle ${ this.handle }`;
    // }
}
