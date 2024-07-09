import type { Answerable, Optional, QuestionAdapter, WithAnswerableProperties } from '@serenity-js/core';
import { Interaction, Question, the, Timestamp } from '@serenity-js/core';
import type { Predicate } from 'tiny-types';
import { ensure, isBoolean, isDefined, isInstanceOf, isOneOf, isPlainObject, isString } from 'tiny-types';

import { CookieMissingError } from '../../errors';
import { BrowseTheWeb } from '../abilities';
import type { CookieData } from './CookieData';

/**
 * A Screenplay Pattern-style model responsible for managing cookies available to the current [`Page`](https://serenity-js.org/api/web/class/Page/).
 *
 * ## Checking if a cookie exists
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { Navigate, Cookie } from '@serenity-js/web'
 * import { Ensure, isPresent } from '@serenity-js/assertions'
 *
 * await actorCalled('Sid')
 *   .attemptsTo(
 *     Navigate.to('https://example.org'),
 *
 *     Ensure.that(
 *       Cookie.called('example-cookie-name'),
 *       isPresent()
 *     ),
 * )
 * ```
 *
 * ## Setting a cookie
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { Navigate, Cookie } from '@serenity-js/web'
 * import { Ensure, isPresent, not } from '@serenity-js/assertions'
 *
 * await actorCalled('Sid')
 *   .attemptsTo(
 *     Navigate.to('https://example.org'),
 *
 *     Ensure.that(Cookie.called('example-cookie-name'), not(isPresent())),
 *
 *     Cookie.set({
 *       name:  'favourite',
 *       value: 'triple chocolate',
 *     }),
 *
 *     Ensure.that(Cookie.called('example-cookie-name'), isPresent()),
 *   )
 * ```
 *
 * ## Reading a cookie
 *
 * ```typescript
 * import { actorCalled } from '@serenity-js/core'
 * import { Navigate, Cookie } from '@serenity-js/web'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * await actorCalled('Sid')
 *   .attemptsTo(
 *     Navigate.to('https://example.org'),
 *
 *     Ensure.that(
 *       Cookie.called('some-cookie-name').value(),
 *       equals('triple chocolate')
 *     ),
 * )
 * ```
 *
 * ## Learn more
 * - [`CookieData`](https://serenity-js.org/api/web/interface/CookieData/)
 * - [`Page.cookie`](https://serenity-js.org/api/web/class/Page/#cookie)
 *
 * @group Models
 */
export abstract class Cookie implements Optional {

    /**
     * Creates a [`QuestionAdapter`](https://serenity-js.org/api/core/#QuestionAdapter) that resolves to [`Cookie`](https://serenity-js.org/api/web/class/Cookie/) identified by `name`.
     *
     * @param name
     */
    static called(name: Answerable<string>): QuestionAdapter<Cookie> {
        return Question.about(`"${ name }" cookie`, async actor => {
            const cookieName    = await actor.answer(name);
            const page          = await BrowseTheWeb.as(actor).currentPage();
            return page.cookie(cookieName);
        });
    }

    /**
     * Sets a cookie for the current [`Page`](https://serenity-js.org/api/web/class/Page/). Note that [`CookieData`](https://serenity-js.org/api/web/interface/CookieData/) can be either a plain-old JavaScript object, or an [`Answerable`](https://serenity-js.org/api/core/#Answerable) [`WithAnswerableProperties`](https://serenity-js.org/api/core/#WithAnswerableProperties).
     *
     * :::info
     * Make sure that the actor performing this interaction is on the page that should receive the cookie.
     * Because of browser security restrictions, an actor can't set a cookie for an arbitrary page without being on that page.
     * :::
     *
     * @param cookieData
     */
    static set(cookieData: Answerable<WithAnswerableProperties<CookieData>>): Interaction {

        return Interaction.where(the`#actor sets cookie: ${ cookieData }`, async actor => {
            const cookie = ensure('cookieData', await actor.answer(Question.fromObject(cookieData)) as CookieData, isDefined(), isPlainObject());

            const page = await BrowseTheWeb.as(actor).currentPage();

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

            return page.setCookie(sanitisedCookieData);
        });
    }

    /**
     * Creates an [interaction](https://serenity-js.org/api/core/class/Interaction/) to delete all cookies available to the current [`Page`](https://serenity-js.org/api/web/class/Page/)..
     */
    static deleteAll(): Interaction {
        return Interaction.where(`#actor deletes all cookies`, async actor => {
            const page = await BrowseTheWeb.as(actor).currentPage();
            await page.deleteAllCookies();
        });
    }

    private cookie: CookieData;

    protected constructor(protected readonly cookieName: string) {
        ensure('browser', cookieName, isDefined());
    }

    /**
     * Returns the name of this cookie.
     */
    name(): string {
        return this.cookieName;
    }

    /**
     * Checks if a given cookie is set.
     *
     * #### Learn more
     * - [`Optional`](https://serenity-js.org/api/core/interface/Optional/)
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
     * Returns the value of a given cookie.
     */
    async value(): Promise<string> {
        const cookie = await this.lazyLoadCookie();
        return cookie.value;
    }

    /**
     * Returns the path of a given cookie, if any was set.
     */
    async path(): Promise<string> {
        const cookie = await this.lazyLoadCookie();
        return cookie.path;
    }

    /**
     * Returns the domain of a given cookie, if any was set.
     */
    async domain(): Promise<string> {
        const cookie = await this.lazyLoadCookie();
        return cookie.domain;
    }

    /**
     * Checks if a given cookie is HTTP-only.
     *
     * #### Learn more
     * - [Mozilla Developer Network: Restricting access to cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
     */
    async isHttpOnly(): Promise<boolean> {
        const cookie = await this.lazyLoadCookie();
        return cookie.httpOnly;
    }

    /**
     * Checks if a given cookie is secure.
     *
     * #### Learn more
     * - [Mozilla Developer Network: Restricting access to cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
     */
    async isSecure(): Promise<boolean> {
        const cookie = await this.lazyLoadCookie();
        return cookie.secure;
    }

    /**
     * Returns the expiry date of a given cookie
     *
     * #### Learn more
     * - [`Timestamp`](https://serenity-js.org/api/core/class/Timestamp/)
     */
    async expiry(): Promise<Timestamp> {
        const cookie = await this.lazyLoadCookie();
        return cookie.expiry;
    }

    /**
     * Deletes a given cookie.
     */
    abstract delete(): Promise<void>;

    /**
     * Reads a given cookie from the browser.
     *
     * This method is to be implemented by test integration tool-specific adapters.
     *
     * **Please note**: you don't need to implement any response caching here
     * since it is covered by [`Cookie`](https://serenity-js.org/api/web/class/Cookie/).lazyLoadCookie} method.
     */
    protected abstract read(): Promise<CookieData>;

    /**
     * Invokes `Cookie.read` and caches the result in memory.
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
    return data[property]
        ? ensure(`Cookie.set(cookieData.${property})`, data[property], ...predicates)
        : undefined;
}
