import { Timestamp } from '@serenity-js/core';

/**
 * @desc
 *  A data structure describing a {@link Cookie} to be set or that's been read.
 *
 * @public
 */
export interface CookieData {
    /**
     * @desc
     *  The name of the cookie.
     *
     * @type {string}
     * @public
     */
    name: string;

    /**
     * @desc
     *  The value of the cookie.
     *
     * @type {string}
     * @public
     */
    value: string;

    /**
     * @desc
     *  The domain the cookie is visible to.
     *  Defaults to the current browsing context's document's URL when setting a cookie.
     *
     * Optional.
     *
     * @type {string}
     * @public
     */
    domain?: string;

    /**
     * @desc
     *  The cookie path. Defaults to "/" when adding a cookie.
     *
     * Optional.
     *
     * @type {string}
     * @public
     */
    path?: string;

    /**
     * @desc
     *  The {@link @serenity-js/core/lib/model~Timestamp} of when the cookie expires.
     *
     * Optional.
     *
     * @type {@serenity-js/core/lib/model~Timestamp}
     * @public
     */
    expiry?: Timestamp;

    /**
     * @desc
     *  Whether the cookie is an HTTP-only cookie. Defaults to false when adding a new cookie.
     *
     * Optional.
     *
     * @type {boolean}
     * @public
     */
    httpOnly?: boolean;

    /**
     * @desc
     *  Whether the cookie is a secure cookie. Defaults to false when adding a new cookie.
     *
     *  Optional.
     *
     * @type {boolean}
     * @public
     */
    secure?: boolean;

    /**
     * @desc
     *  Whether the cookie applies to a SameSite policy.
     *  Defaults to "None" if omitted when adding a cookie.
     *
     *  Can be set to either "Lax" or "Strict".
     *
     *  Optional.
     *
     * @type {string}
     * @public
     */
    sameSite?: 'Lax' | 'Strict' | 'None';
}
