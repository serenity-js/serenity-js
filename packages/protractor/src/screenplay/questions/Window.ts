import { Question } from '@serenity-js/core';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

export class Window {

    /**
     * @desc
     *  Returns the size of the current browser window.
     *
     * @returns {Question<Promise<{ width: number, height: number }>>}
     */
    static size(): Question<Promise<{ width: number, height: number }>> {
        return Question.about(`browser window size`, actor =>
            promiseOf(BrowseTheWeb.as(actor).manage().window().getSize()));
    }

    /**
     * @desc
     *  Returns the `{ x: number, y: number }` position of the current browser window.
     *
     * @returns {Question<Promise<{ x: number, y: number }>>}
     */
    static position(): Question<Promise<{ x: number, y: number }>> {
        return Question.about(`browser window position`, actor =>
            promiseOf(BrowseTheWeb.as(actor).manage().window().getPosition()));
    }
}
