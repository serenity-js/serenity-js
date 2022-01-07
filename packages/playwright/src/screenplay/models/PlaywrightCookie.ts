import { Cookie, CookieData } from '@serenity-js/web';
import * as pw from 'playwright';

export class PlaywrightCookie extends Cookie {
    public static from(name: string, page: pw.Page): Cookie {
        return new this(name, page);
    }

    private _originalCookie: pw.Cookie;

    private constructor(
        name: string,
        private readonly page: pw.Page
    ) {
        super(name);
    }

    private async getOriginalCookie() {
        if (!this._originalCookie) {
            const allCookies = await this.page.context().cookies();
            this._originalCookie = allCookies.find((cookie) => this.name() === cookie.name);
        }
        return this._originalCookie;
    }

    async delete(): Promise<void> {
        const cookie = await this.getOriginalCookie();
        await this.page.evaluate(`document.cookie = '${this.name()}=; Path=${cookie.path}; Domain=${cookie.domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'`);
    }

    protected read(): Promise<CookieData> {
        return this.getOriginalCookie();
    }
}
