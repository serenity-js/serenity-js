import { RootLocator } from '@serenity-js/web';
import type * as playwright from 'playwright-core';
import { ensure, isDefined } from 'tiny-types';

import { promised } from '../../promised';

/**
 * Playwright-specific implementation of {@apilink RootLocator}.
 *
 * @group Models
 */
export class PlaywrightRootLocator extends RootLocator<playwright.Locator> {

    private currentFrame: playwright.Frame;

    constructor(private readonly page: playwright.Page) {
        super();
        this.currentFrame = this.page.mainFrame();
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    nativeElement(): Promise<Pick<playwright.Locator, 'locator'>> {
        return promised(this.currentFrame);
    }

    async switchToFrame(frame: playwright.Locator): Promise<void> {
        const element = await frame.elementHandle();
        this.currentFrame = ensure('frame', await element.contentFrame(), isDefined());
    }

    async switchToParentFrame(): Promise<void> {
        this.currentFrame = ensure('parent frame', this.currentFrame.parentFrame(), isDefined());
    }

    async switchToMainFrame(): Promise<void> {
        this.currentFrame = this.page.mainFrame();
    }
}
