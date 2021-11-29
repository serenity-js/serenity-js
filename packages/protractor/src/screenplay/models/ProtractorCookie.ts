import { Timestamp } from '@serenity-js/core';
import { Cookie } from '@serenity-js/web';
import { ProtractorBrowser } from 'protractor';
import { ensure, isDefined } from 'tiny-types';

import { promiseOf } from '../../promiseOf';

export class ProtractorCookie extends Cookie {

    constructor(
        private readonly browser: ProtractorBrowser,
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
        return promiseOf(this.browser.manage().deleteCookie(this.cookieName));
    }
}
