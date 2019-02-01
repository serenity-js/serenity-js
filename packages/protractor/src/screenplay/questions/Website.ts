import { Question } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

export class Website {
    static title(): Question<Promise<string>> {
        return Question.about(`the title of the current page`, actor =>
            BrowseTheWeb.as(actor).getTitle(),
        );
    }

    static url(): Question<Promise<string>> {
        return Question.about(`the url of the current page`, actor =>
            BrowseTheWeb.as(actor).getCurrentUrl(),
        );
    }
}
