import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

export class DeleteCookies {
    static called(cookieName: Answerable<string>) {
        return new DeleteCookieCalled(cookieName);
    }

    static all() {
        return new DeletesAllCookies();
    }
}

/**
 * @package
 */
class DeleteCookieCalled implements Interaction {
    constructor(private readonly name: Answerable<string>) {
    }

    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return actor.answer(this.name)
            .then(name => BrowseTheWeb.as(actor).manage().deleteCookie(name));
    }

    toString(): string {
        return formatted `#actor deletes the "${ this.name }" cookie`;
    }
}

/**
 * @package
 */
class DeletesAllCookies implements Interaction {
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).manage().deleteAllCookies());
    }

    toString(): string {
        return `#actor deletes all cookies`;
    }
}
