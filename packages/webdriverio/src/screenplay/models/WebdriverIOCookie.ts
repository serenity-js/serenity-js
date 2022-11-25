import { Timestamp } from '@serenity-js/core';
import { Cookie, CookieData, CookieMissingError } from '@serenity-js/web';
import { ensure, isDefined } from 'tiny-types';
import * as wdio from 'webdriverio';

/**
 * WebdriverIO-specific implementation of {@apilink Cookie}.
 *
 * @group Models
 */
export class WebdriverIOCookie extends Cookie {

    constructor(
        private readonly browser: wdio.Browser<'async'>,
        cookieName: string,
    ) {
        super(cookieName);
        ensure('browser', browser, isDefined());
    }

    async delete(): Promise<void> {
        await this.browser.deleteCookies(this.cookieName);
    }

    protected async read(): Promise<CookieData> {
        const [ cookie ] = await this.browser.getCookies(this.cookieName);

        if (! cookie) {
            throw new CookieMissingError(`Cookie '${ this.cookieName }' not set`);
        }

        // There _might_ be a bug in WDIO where the expiry date is set on "expires" rather than the "expiry" key
        // and possibly another one around deserialising the timestamp, since WDIO seems to add several hundred milliseconds
        // to the original expiry date
        const expiry: number | undefined = cookie.expiry || (cookie as any).expires;

        return {
            name:       cookie.name,
            value:      cookie.value,
            domain:     cookie.domain,
            path:       cookie.path,
            expiry:     typeof expiry === 'number' && expiry >= 0
                ? Timestamp.fromTimestampInSeconds(Math.round(expiry))
                : undefined,
            httpOnly:   cookie.httpOnly,
            secure:     cookie.secure,
        }
    }
}
