import { Page } from '@serenity-js/web';
import { ProtractorBrowser } from 'protractor';

import { promiseOf } from '../promiseOf';

export class ProtractorPage extends Page {
    constructor(
        private readonly browser: ProtractorBrowser,
        handle: string
    ) {
        super(handle);
    }

    title(): Promise<string> {
        return promiseOf(this.browser.getTitle());
    }
}
