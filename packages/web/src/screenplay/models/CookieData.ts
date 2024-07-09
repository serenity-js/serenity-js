import type { Timestamp } from '@serenity-js/core';

/**
 * A data structure describing a [`Cookie`](https://serenity-js.org/api/web/class/Cookie/) to be set, or one that's been read.
 *
 * ## Learn more
 *
 * - [`Cookie`](https://serenity-js.org/api/web/class/Cookie/)
 * - [`Page.cookie`](https://serenity-js.org/api/web/class/Page/#cookie)
 *
 * @group Models
 */
export interface CookieData {

    /**
     * The name of the cookie.
     */
    name: string;

    /**
     * The value of the cookie.
     */
    value: string;

    /**
     * The domain this cookie is visible to.
     *
     * Defaults to the current browsing context's document's URL when setting a cookie.
     */
    domain?: string;

    /**
     * The cookie path. Defaults to "/" when adding a cookie.
     */
    path?: string;

    /**
     * The [timestamp](https://serenity-js.org/api/core/class/Timestamp/) describing the point in time when this cookie expires.
     */
    expiry?: Timestamp;

    /**
     * Whether the cookie is an HTTP-only cookie.
     * Defaults to `false` when adding a new cookie.
     */
    httpOnly?: boolean;

    /**
     * Whether the cookie is a secure cookie.
     * Defaults to `false` when adding a new cookie.
     */
    secure?: boolean;

    /**
     * Whether the cookie applies to a `SameSite` policy.
     * Defaults to `None` if omitted when adding a cookie.
     */
    sameSite?: 'Lax' | 'Strict' | 'None';
}
