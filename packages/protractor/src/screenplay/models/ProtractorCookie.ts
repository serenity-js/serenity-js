import { Timestamp } from '@serenity-js/core';
import { Cookie, CookieData, CookieMissingError } from '@serenity-js/web';
import { ProtractorBrowser } from 'protractor';
import { ensure, isDefined } from 'tiny-types';

import { promised } from '../promised';

export class ProtractorCookie extends Cookie {

    constructor(private readonly browser: ProtractorBrowser, cookieName: string) {
        super(cookieName);
        ensure('browser', browser, isDefined());
    }

    delete(): Promise<void> {
        return promised(this.browser.manage().deleteCookie(this.cookieName));
    }

    /**
     * @protected
     */
    protected async read(): Promise<CookieData> {
        const cookie = await this.browser.manage().getCookie(this.cookieName);

        if (! cookie) {
            throw new CookieMissingError(`Cookie '${ this.cookieName }' not set`);
        }

        return {
            name:       cookie.name,
            value:      cookie.value,
            domain:     cookie.domain,
            path:       cookie.path,
            expiry:     cookie.expiry !== undefined
                ? Timestamp.fromTimestampInSeconds(Math.round(cookie.expiry))
                : undefined,
            httpOnly:   cookie.httpOnly,
            secure:     cookie.secure,
        }
    }
}
