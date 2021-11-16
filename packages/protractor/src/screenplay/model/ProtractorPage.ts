import { Page } from '@serenity-js/web';
import { ProtractorBrowser } from 'protractor';

import { promiseOf } from '../../promiseOf';

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

    viewportSize(): Promise<{ width: number, height: number }> {
        return promiseOf(this.browser.manage().window().getSize());
    }

    setViewportSize(size: { width: number, height: number }): Promise<void> {
        return promiseOf(this.browser.manage().window().setSize(size.width, size.height));
    }
}
