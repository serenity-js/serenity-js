import { Expectation, ExpectationMet, ExpectationOutcome, LogicError, Optional, Question, QuestionAdapter } from '@serenity-js/core';
import { URL } from 'url';

import { BrowseTheWeb } from '../abilities';
import { Switchable } from './Switchable';

export abstract class Page implements Optional, Switchable {
    static current(): QuestionAdapter<Page> {
        return Question.about<Page>('current page', actor => {
            return BrowseTheWeb.as(actor).currentPage();
        });
    }

    static whichName(expectation: Expectation<string>): QuestionAdapter<Page> {
        return Question.about(`page which name does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();

            return Page.findMatchingPage(
                `name does ${ expectation }`,
                pages,
                page => actor.answer(expectation.isMetFor(page.name())),
            );
        });
    }

    static whichTitle(expectation: Expectation<string>): QuestionAdapter<Page> {
        return Question.about(`page which title does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();

            return Page.findMatchingPage(
                `title does ${ expectation }`,
                pages,
                page => actor.answer(expectation.isMetFor(page.title())),
            );
        });
    }

    static whichUrl(expectation: Expectation<string>): QuestionAdapter<Page> {
        return Question.about(`page which URL does ${ expectation }`, async actor => {
            const pages     = await BrowseTheWeb.as(actor).allPages();

            return Page.findMatchingPage(
                `url does ${ expectation }`,
                pages,
                page => actor.answer(expectation.isMetFor(
                    page.url().then(url => url.toString()))
                )
            );
        });
    }

    private static async findMatchingPage(expectationDescription: string, pages: Page[], matcher: (page: Page) => Promise<ExpectationOutcome<any, any>>): Promise<Page> {
        for (const page of pages) {
            const outcome  = await matcher(page);

            if (outcome instanceof ExpectationMet) {
                return page;
            }
        }

        throw new LogicError(`Couldn't find a page which ${ expectationDescription }`);
    }

    constructor(
        protected readonly handle: string,
    ) {
    }

    /**
     * @desc
     *  Retrieves the document title of the current top-level browsing context, equivalent to calling `document.title`.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
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

    /**
     * @desc
     *  Retrieves the name of the current top-level browsing context.
     *
     * @returns {Promise<string>}
     */
    abstract name(): Promise<string>;

    /**
     * @desc
     *  Checks if a given window / tab / page is open and can be switched to.
     *
     * @returns {Promise<string>}
     */
    abstract isPresent(): Promise<boolean>;

    /**
     * @desc
     *  Returns the actual viewport size available for the given page,
     *  excluding any scrollbars.
     *
     * @returns {Promise<{ width: number, height: number }>}
     */
    abstract viewportSize(): Promise<{ width: number, height: number }>;

    /**
     *
     * @param size
     */
    abstract setViewportSize(size: { width: number, height: number }): Promise<void>;

    /**
     * @desc
     *  Switches the current browsing context to the given pare
     *  and returns an object that allows the caller to switch back
     *  to the previous context if needed.
     *
     * @returns {Promise<{ switchBack(): Promise<void> }>}
     */
    abstract switchTo(): Promise<{ switchBack(): Promise<void> }>;

    /**
     * @desc
     *  Closes the given page.
     *
     * @returns {Promise<void>}
     */
    abstract close(): Promise<void>;

    /**
     * @desc
     *  Closes any open pages, except for this one.
     *
     * @returns {Promise<void>}
     */
    abstract closeOthers(): Promise<void>;

    toString(): string {
        return `page (handle=${ this.handle })`;
    }
}
