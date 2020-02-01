import { Answerable, AnswersQuestions, Interaction, UsesAbilities } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { promiseOf } from '../../promiseOf';
import { BrowseTheWeb } from '../abilities';

export class DeleteCookies {
    static called(cookieName: Answerable<string>): Interaction {
        return new DeleteCookieCalled(cookieName);
    }

    static all(): Interaction {
        return new DeletesAllCookies();
    }
}

/**
 * @package
 */
class DeleteCookieCalled implements Interaction {
    constructor(private readonly name: Answerable<string>) {
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return actor.answer(this.name)
            .then(name => BrowseTheWeb.as(actor).manage().deleteCookie(name));
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return formatted `#actor deletes the "${ this.name }" cookie`;
    }
}

/**
 * @package
 */
class DeletesAllCookies implements Interaction {

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  perform this {@link @serenity-js/core/lib/screenplay~Interaction}.
     *
     * @param {UsesAbilities & AnswersQuestions} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     */
    performAs(actor: UsesAbilities & AnswersQuestions): Promise<void> {
        return promiseOf(BrowseTheWeb.as(actor).manage().deleteAllCookies());
    }

    /**
     * @desc
     *  Generates a description to be used when reporting this {@link @serenity-js/core/lib/screenplay~Activity}.
     *
     * @returns {string}
     */
    toString(): string {
        return `#actor deletes all cookies`;
    }
}
