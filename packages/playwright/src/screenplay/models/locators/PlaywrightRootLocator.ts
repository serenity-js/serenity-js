import { RootLocator } from '@serenity-js/web';
import type * as playwright from 'playwright-core';
import { ensure, isDefined } from 'tiny-types';

/**
 * Playwright-specific implementation of {@apilink RootLocator}.
 *
 * @group Models
 */
export class PlaywrightRootLocator extends RootLocator<playwright.ElementHandle> {

    private currentFrame: playwright.Frame;

    constructor(private readonly page: playwright.Page) {
        super();
        this.currentFrame = this.page.mainFrame();
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    async nativeElement(): Promise<Pick<playwright.ElementHandle, '$' | '$$' | 'waitForSelector'>> {
        return this.currentFrame;
    }

    async switchToFrame(frame: playwright.ElementHandle): Promise<void> {
        this.currentFrame = ensure('frame', await frame.contentFrame(), isDefined());
    }

    async switchToParentFrame(): Promise<void> {
        this.currentFrame = ensure('parent frame', this.currentFrame.parentFrame(), isDefined());
    }

    async switchToMainFrame(): Promise<void> {
        this.currentFrame = this.page.mainFrame();
    }
}
