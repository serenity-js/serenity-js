import { Question } from '@serenity-js/core';
import { ISize } from 'selenium-webdriver';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

export class Window {

    /**
     * @desc
     *  Enables asserting on the browser window size.
     *
     * @returns {Question<Promise<ISize>>}
     */
    static size(): Question<Promise<ISize>> {
        return Question.about(`browser window size`, actor =>
            promiseOf(BrowseTheWeb.as(actor).manage().window().getSize()));
    }
}
