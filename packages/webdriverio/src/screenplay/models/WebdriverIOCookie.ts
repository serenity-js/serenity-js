import { Timestamp } from '@serenity-js/core';
import { Cookie } from '@serenity-js/web';
import { ensure, isDefined } from 'tiny-types';
import * as wdio from 'webdriverio';

export class WebdriverIOCookie extends Cookie {
    constructor(
        private readonly browser: wdio.Browser<'async'>,
        name: string,
        value: string,
        domain?: string,
        path?: string,
        expiry?: Timestamp,
        httpOnly?: boolean,
        secure?: boolean,
    ) {
        super(name, value, domain, path, expiry, httpOnly, secure);
        ensure('browser', browser, isDefined());
    }

    delete(): Promise<void> {
        return this.browser.deleteCookies(this.cookieName) as Promise<void>;
    }
}
