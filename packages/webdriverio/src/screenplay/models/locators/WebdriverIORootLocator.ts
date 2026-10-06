import 'webdriverio';

import { RootLocator } from '@serenity-js/web';

/**
 * WebdriverIO-specific implementation of [`RootLocator`](https://serenity-js.org/api/web/class/RootLocator/).
 *
 * @group Models
 */
export class WebdriverIORootLocator extends RootLocator<WebdriverIO.Element> {

    /**
     * Frames entered via this locator, outermost first.
     *
     * When using WebDriver BiDi, WebdriverIO updates its internal browsing context
     * asynchronously after `browser.switchToParentFrame()` returns, so a command issued
     * straight afterwards might still run in the frame the browser has just left.
     * To avoid this race condition, the locator switches to the parent frame
     * by switching to the top-level browsing context and re-entering the frames above the current one,
     * as `browser.switchFrame` updates the browsing context before it returns.
     */
    private readonly frames: WebdriverIO.Element[] = [];

    constructor(private readonly browser: WebdriverIO.Browser) {
        super();
    }

    async isPresent(): Promise<boolean> {
        return true;
    }

    async nativeElement(): Promise<Pick<WebdriverIO.Browser, '$' | '$$'>> {
        return this.browser;
    }

    async switchToFrame(frame: WebdriverIO.Element | null): Promise<void> {
        await this.browser.switchFrame(frame);

        if (frame === null) {
            this.frames.length = 0;
            return;
        }

        this.frames.push(frame);
    }

    async switchToParentFrame(): Promise<void> {
        const canReEnterParentFrames = this.browser.isBidi && this.frames.length > 0;

        this.frames.pop();

        if (! canReEnterParentFrames) {
            await this.browser.switchToParentFrame();
            return;
        }

        await this.browser.switchFrame(null);

        for (const frame of this.frames) {
            await this.browser.switchFrame(frame);
        }
    }

    async switchToMainFrame(): Promise<void> {
        this.frames.length = 0;
        await this.browser.switchFrame(null);
    }
}
