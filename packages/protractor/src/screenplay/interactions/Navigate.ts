import { AnswersQuestions, Interaction, KnowableUnknown, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { BrowseTheWeb } from '../abilities';
import { promiseOf } from '../promiseOf';

/**
 * @desc
 *  Allows the {Actor} to navigate to a specific destination,
 *  as well as back and forth in the browser history.
 *
 * @abstract
 * @implements {Interaction}
 */
export abstract class Navigate implements Interaction {

    static to(url: string) {
        return new NavigateToUrl(url);
    }

    static back() {
        return new NavigateBack();
    }

    static forward() {
        return new NavigateForward();
    }

    abstract performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;

    abstract toString(): string;
}

class NavigateToUrl extends Navigate {
    constructor(private readonly url: KnowableUnknown<string>) {
        super();
    }

    performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void> {
        return actor.answer(this.url).then(url =>
            BrowseTheWeb.as(actor).get(url),
        );
    }

    toString(): string {
        return formatted `#actor navigates to ${ this.url }`;
    }
}

class NavigateBack extends Navigate {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).navigate().back());
    }

    toString(): string {
        return formatted `#actor navigates back in the browser history`;
    }
}

class NavigateForward extends Navigate {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).navigate().forward());
    }

    toString(): string {
        return formatted `#actor navigates forward in the browser history`;
    }
}
