/* eslint-disable unicorn/consistent-function-scoping */
import { Answerable, AnswersQuestions, Question, Transform, UsesAbilities } from '@serenity-js/core';
import { IWebDriverOptionsCookie } from 'selenium-webdriver';
import { BrowseTheWeb } from '../abilities';

export class Cookie {
    static valueOf(cookieName: Answerable<string>): Question<Promise<string>> {
        return Transform.the(new CookieDetails(cookieName), details => details && details.value)
            .as(`the value of the "${ cookieName }" cookie`);
    }

    static pathOf(cookieName: Answerable<string>): Question<Promise<string>> {
        return Transform.the(new CookieDetails(cookieName), details => details && details.path)
            .as(`the path of the "${ cookieName }" cookie`);
    }

    static domainOf(cookieName: string): Question<Promise<string>> {
        return new CookieDetails(cookieName)
            .map(actor => details => details?.domain)
            .describedAs(`the domain of the "${ cookieName }" cookie`);
    }

    static isHTTPOnly(cookieName: string): Question<Promise<boolean>> {
        return new CookieDetails(cookieName)
            .map(actor => details => details && !! details.httpOnly)
            .describedAs(`the HTTP-only status of the "${ cookieName }" cookie`);
    }

    static isSecure(cookieName: string): Question<Promise<boolean>> {
        return new CookieDetails(cookieName)
            .map(actor => details => details && !! details.secure)
            .describedAs(`the "secure" status of the "${ cookieName }" cookie`);
    }

    static expiryDateOf(cookieName: string): Question<Promise<Date>> {
        return new CookieDetails(cookieName)
            .map(actor => details =>
                details?.expiry && new Date(Number(details.expiry) * 1000) // expiry date coming from webdriver is expressed in seconds
            )
            .describedAs(`the expiry date of the "${ cookieName }" cookie`);
    }
}

/**
 * @package
 */
class CookieDetails extends Question<Promise<IWebDriverOptionsCookie>> {
    constructor(private readonly name: Answerable<string>) {
        super(`the details of the "${ name } cookie`);
    }

    /**
     * @desc
     *  Makes the provided {@link @serenity-js/core/lib/screenplay/actor~Actor}
     *  answer this {@link @serenity-js/core/lib/screenplay~Question}.
     *
     * @param {AnswersQuestions & UsesAbilities} actor
     * @returns {Promise<void>}
     *
     * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
     * @see {@link @serenity-js/core/lib/screenplay/actor~AnswersQuestions}
     * @see {@link @serenity-js/core/lib/screenplay/actor~UsesAbilities}
     */
    answeredBy(actor: AnswersQuestions & UsesAbilities): Promise<IWebDriverOptionsCookie> {
        return actor.answer(this.name)
            .then(name => BrowseTheWeb.as(actor).manage().getCookie(name))
            .then(details => details ? details : undefined);
    }
}
