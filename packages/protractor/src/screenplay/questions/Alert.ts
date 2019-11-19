import { Question } from '@serenity-js/core';
import { BrowseTheWeb } from '../abilities';

export class Alert {
    static visibility(): Question<boolean> {
        return Question.about(`the visibility of an alert`, actor => {
                try {
                    BrowseTheWeb.as(actor).switchToAlert();
                    return true;
                } catch (e) {
                    return false;
                }
            },
        );
    }

    static text(): Question<Promise<string>> {
        return Question.about(`the alert text`, actor => {
                return BrowseTheWeb.as(actor).alertText();
            },
        );
    }

}
