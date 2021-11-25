import { Answerable, Interaction, Model, Question, Timestamp } from '@serenity-js/core';

import { BrowseTheWeb } from '../abilities';

export abstract class Cookie {

    /**
     * @desc
     *  Creates a {@link @serenity-js/core/lib/screenplay~Question} about a Cookie
     *
     * @param {Answerable<string>} name
     * @returns {Question<Promise<Cookie>> & Model<Cookie>}
     */
    static called(name: Answerable<string>): Question<Promise<Cookie>> & Model<Cookie> {
        return Question.about(`"${ name }" cookie`, async actor => {
            const cookieName = await actor.answer(name);
            return BrowseTheWeb.as(actor).cookie(cookieName);
        });
    }

    /**
     * @desc
     *  Checks if a cookie given by `name` is set.
     *
     * @param {Answerable<string>} name
     * @returns {Question<Promise<boolean>>}
     */
    static has(name: Answerable<string>): Question<Promise<boolean>> {
        return Question.about(`presence of "${ name }" cookie`, async actor => {
            const cookieName = await actor.answer(name);
            let cookie;
            try {
                cookie = await BrowseTheWeb.as(actor).cookie(cookieName);
                return cookie !== undefined;
            } catch {
                return false;
            }
        });
    }

    /**
     * @desc
     *  Creates an {@link @serenity-js/core/lib/screenplay~Interaction} to delete all cookies currently set in the browser.
     *
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static deleteAll(): Interaction {
        return Interaction.where(`#actor deletes all cookies`, actor => {
            return BrowseTheWeb.as(actor).deleteAllCookies();
        });
    }

    constructor(
        protected readonly cookieName: string,
        protected readonly cookieValue: string,
        protected readonly cookieDomain?: string,
        protected readonly cookiePath?: string,
        protected readonly cookieExpiryDate?: Timestamp,
        protected readonly httpOnly?: boolean,
        protected readonly secure?: boolean,
    ) {
    }

    name(): string {
        return this.cookieName;
    }

    value(): string {
        return this.cookieValue;
    }

    path(): string {
        return this.cookiePath;
    }

    domain(): string {
        return this.cookieDomain;
    }

    isHttpOnly(): boolean {
        return this.httpOnly;
    }

    isSecure(): boolean {
        return this.secure;
    }

    expiry(): Timestamp {
        return this.cookieExpiryDate;
    }

    abstract delete(): Promise<void>;
}
