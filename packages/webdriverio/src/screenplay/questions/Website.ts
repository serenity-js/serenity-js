import { Question } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

export class Website {

    /**
     * @desc
     *  Retrieves the document title of the current top-level browsing context, equivalent to calling `document.title`.
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<Promise<string>>}
     *
     * @see https://webdriver.io/docs/api/webdriver/#gettitle
     */
    static title(): Question<Promise<string>> {
        return Question.about(`the title of the current page`, actor =>
            BrowseTheWeb.as(actor).browser.getTitle(),
        );
    }

    /**
     * @desc
     *  Retrieves the URL of the current top-level browsing context.
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<Promise<string>>}
     *
     * @see https://webdriver.io/docs/api/webdriver/#geturl
     */
    static url(): Question<Promise<string>> {
        return Question.about(`the url of the current page`, actor =>
            BrowseTheWeb.as(actor).browser.getUrl(),
        );
    }
}
