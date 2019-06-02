import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Allows the {Actor} to navigate to a specific destination,
 *  as well as back and forth in the browser history.
 *
 * @abstract
 * @extends {Interaction}
 */
export abstract class Navigate extends Interaction {

    static to(url: Answerable<string>) {
        return new NavigateToUrl(url);
    }

    static back() {
        return new NavigateBack();
    }

    static forward() {
        return new NavigateForward();
    }

    static reloadPage() {
        return new ReloadPage();
    }

    abstract performAs(actor: UsesAbilities & AnswersQuestions): PromiseLike<void>;

    abstract toString(): string;
}

/**
 * @package
 */
class NavigateToUrl extends Navigate {
    constructor(private readonly url: Answerable<string>) {
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

/**
 * @package
 */
class NavigateBack extends Navigate {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).navigate().back());
    }

    toString(): string {
        return formatted `#actor navigates back in the browser history`;
    }
}

/**
 * @package
 */
class NavigateForward extends Navigate {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).navigate().forward());
    }

    toString(): string {
        return formatted `#actor navigates forward in the browser history`;
    }
}

/**
 * @package
 */
class ReloadPage extends Navigate {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).navigate().refresh());
    }

    toString(): string {
        return formatted `#actor reloads the page`;
    }
}
