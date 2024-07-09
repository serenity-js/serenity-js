import { RootLocator } from '@serenity-js/web';
import type * as playwright from 'playwright-core';
import { type PageFunction } from 'playwright-core/types/structs';
import { ensure, isDefined } from 'tiny-types';

import { promised } from '../../promised';

/**
 * Playwright-specific implementation of [`RootLocator`](https://serenity-js.org/api/web/class/RootLocator/).
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

    /**
     * Evaluates the given `pageFunction` in the context of the current frame.
     * See [`playwright.Frame.evaluate`](https://playwright.dev/docs/api/class-frame#frame-evaluate).
     *
     * @param pageFunction
     * @param arg
     */
    evaluate<R, Arguments>(pageFunction: PageFunction<Arguments, R>, arg: Arguments): Promise<R>;
    evaluate<R>(pageFunction: PageFunction<void, R>, arg?: any): Promise<R> {   // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
        return this.currentFrame.evaluate(pageFunction, arg);
    }

    /**
     * Switches the current context to the frame identified by the given locator.
     *
     * @param frame
     */
    async switchToFrame(frame: playwright.Locator): Promise<void> {
        const element = await frame.elementHandle();
        this.currentFrame = ensure('frame', await element.contentFrame(), isDefined());
    }

    /**
     * Switches the current context to the parent frame of the current frame.
     */
    async switchToParentFrame(): Promise<void> {
        this.currentFrame = ensure('parent frame', this.currentFrame.parentFrame(), isDefined());
    }

    /**
     * Switches the context to the top-level frame.
     */
    async switchToMainFrame(): Promise<void> {
        this.currentFrame = this.page.mainFrame();
    }
}
