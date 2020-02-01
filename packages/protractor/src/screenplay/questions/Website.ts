import { Question } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

export class Website {
    /**
     * Retrieves the title of the current page.
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<Promise<string>>}
     */
    static title(): Question<Promise<string>> {
        return Question.about(`the title of the current page`, actor =>
            BrowseTheWeb.as(actor).getTitle(),
        );
    }

    /**
     * Retrieves the url of the current page.
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<Promise<string>>}
     */
    static url(): Question<Promise<string>> {
        return Question.about(`the url of the current page`, actor =>
            BrowseTheWeb.as(actor).getCurrentUrl(),
        );
    }
}
