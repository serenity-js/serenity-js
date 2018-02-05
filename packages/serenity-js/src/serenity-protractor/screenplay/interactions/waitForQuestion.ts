import { until, WebDriver } from 'selenium-webdriver';
import { BrowseTheWeb } from '../abilities/browse_the_web';
import Condition = until.Condition;
import { Interaction, Question, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { Duration } from './wait';

export class WaitForQuestion implements Interaction {

    performAs(actor: UsesAbilities): PromiseLike<void> {
        return BrowseTheWeb.as(actor).wait(() =>
                this.question.answeredBy(actor).then(result => {
                    return result;
                }, (error: Error) => {
                    if (error.name === 'StaleElementReferenceError') {
                        // this happens a lot when question is being asked against a changing page, so return false and wait for next time.
                        // tslint:disable-next-line:no-console
                        console.warn(`[WaitForQuestion] handling error: ${error.name}`);
                        return false;
                    } else {
                        throw error;
                    }
                }),
            this.timeout.toMillis(),
            `${ this.question } failed to return true answer within timeout period`,
        );
    }

    toString = () => `{0} waits for ${ this.question }`;

    constructor(private question: Question<PromiseLike<boolean>>, private timeout: Duration) {
    }

}
