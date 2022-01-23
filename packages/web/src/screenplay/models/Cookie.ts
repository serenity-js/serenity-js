import { Answerable, Interaction, Optional, Question, QuestionAdapter, Timestamp } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';
import { ensure, isBoolean, isDefined, isInstanceOf, isOneOf, isPlainObject, isString, Predicate } from 'tiny-types';

import { CookieMissingError } from '../../errors';
import { BrowseTheWeb } from '../abilities';
import { CookieData } from './CookieData';

export abstract class Cookie implements Optional {

    /**
     * @desc
     *  Creates a {@link @serenity-js/core/lib/screenplay~Question} about a Cookie
     *
     * @param {Answerable<string>} name
     * @returns {Question<Promise<Cookie>> & Adapter<Cookie>}
     */
    static called(name: Answerable<string>): QuestionAdapter<Cookie> {
        return Question.about(`"${ name }" cookie`, async actor => {
            const cookieName = await actor.answer(name);
            return BrowseTheWeb.as(actor).cookie(cookieName);
        });
    }

    /**
     * @desc
     *  Sets a cookie for the current page.
     *  Make sure that the actor performing this interaction is on the page that should receive the cookie.
     *  An actor can't set a cookie for an arbitrary page without being on that page.
     *
     * @param {Answerable<CookieData>} cookieData
     * @returns {@serenity-js/core/lib/screenplay~Interaction}
     */
    static set(cookieData: Answerable<CookieData>): Interaction {

        return Interaction.where(formatted `#actor sets cookie: ${ cookieData }`, async actor => {
            const cookie = ensure('cookieData', await actor.answer(cookieData), isDefined(), isPlainObject());

            const sanitisedCookieData: CookieData = {
                name:         ensure(`Cookie.set(cookieData.name)`,     cookie.name,  isDefined(), isString()),
                value:        ensure(`Cookie.set(cookieData.value)`,    cookie.value, isDefined(), isString()),
                path:         ensureIfPresent(cookie, 'path',       isString()),
                domain:       ensureIfPresent(cookie, 'domain',     isString()),
                secure:       ensureIfPresent(cookie, 'secure',     isBoolean()),
                httpOnly:     ensureIfPresent(cookie, 'httpOnly',   isBoolean()),
                expiry:       ensureIfPresent(cookie, 'expiry',     isInstanceOf(Timestamp)),
                sameSite:     ensureIfPresent(cookie, 'sameSite',   isOneOf<'Lax' | 'Strict' | 'None'>('Lax', 'Strict', 'None')),
            }

            return BrowseTheWeb.as(actor).setCookie(sanitisedCookieData);
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

    private cookie: CookieData;

    protected constructor(protected readonly cookieName: string) {
        ensure('browser', cookieName, isDefined());
    }

    name(): string {
        return this.cookieName;
    }

    /**
     * @desc
     *  Checks if a given cookie is set.
     *
     * @returns {Promise<boolean>}
     */
    async isPresent(): Promise<boolean> {
        try {
            const cookie = await this.lazyLoadCookie();
            return cookie && cookie.name === this.cookieName;
        }
        catch(error) {
            if (error instanceof CookieMissingError) {
                return false;
            }

            throw error;
        }
    }

    /**
     * @desc
     *  Returns the value of a given cookie.
     *
     * @returns {Promise<string>}
     */
    async value(): Promise<string> {
        const cookie = await this.lazyLoadCookie();
        return cookie.value;
    }

    /**
     * @desc
     *  Returns the path of a given cookie, if any was set.
     *
     * @returns {Promise<string>}
     */
    async path(): Promise<string> {
        const cookie = await this.lazyLoadCookie();
        return cookie.path;
    }

    /**
     * @desc
     *  Returns the domain of a given cookie, if any was set.
     *
     * @returns {Promise<string>}
     */
    async domain(): Promise<string> {
        const cookie = await this.lazyLoadCookie();
        return cookie.domain;
    }

    /**
     * @desc
     *  Checks if a given cookie is HTTP-only.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies
     *
     * @returns {Promise<string>}
     */
    async isHttpOnly(): Promise<boolean> {
        const cookie = await this.lazyLoadCookie();
        return cookie.httpOnly;
    }

    /**
     * @desc
     *  Checks if a given cookie is secure.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies
     *
     * @returns {Promise<string>}
     */
    async isSecure(): Promise<boolean> {
        const cookie = await this.lazyLoadCookie();
        return cookie.secure;
    }

    /**
     * @desc
     *  Returns the expiry date of a given cookie
     *
     * @returns {Promise<Timestamp>}
     */
    async expiry(): Promise<Timestamp> {
        const cookie = await this.lazyLoadCookie();
        return cookie.expiry;
    }

    /**
     * @desc
     *  Deletes a given cookie.
     *
     * @abstract
     *
     * @returns {Promise<void>}
     */
    abstract delete(): Promise<void>;

    /**
     * @desc
     *  Reads a given cookie from the browser.
     *
     *  This method is to be implemented by integration tool-specific adapters.
     *  **Please note**: you don't need to implement any response caching here
     *  since it is covered by {@link Cookie#lazyLoadCookie} method.
     *
     * @protected
     * @abstract
     *
     * @returns {Promise<void>}
     */
    protected abstract read(): Promise<CookieData>;

    /**
     * @desc
     *  Invokes {@link Cookie#read} and caches the result in memory.
     *
     * @private
     * @returns {Promise<CookieData>}
     */
    private async lazyLoadCookie(): Promise<CookieData> {
        if (! this.cookie) {
            this.cookie = await this.read();
        }

        return this.cookie;
    }
}

/**
 * @ignore
 * @private
 *
 * @param data
 * @param property
 * @param predicates
 */
function ensureIfPresent<K extends keyof CookieData>(data: CookieData, property: K, ...predicates: Array<Predicate<CookieData[K]>>): CookieData[K] | undefined {
    return data[property] !== undefined
        ? ensure(`Cookie.set(cookieData.${property})`, data[property], ...predicates)
        : undefined;
}
