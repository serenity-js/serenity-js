import { defer } from '@serenity-js/core/lib/recording/async';
import { Ability, UsesAbilities } from '@serenity-js/core/lib/screenplay';
import { ElementArrayFinder, ElementFinder, ProtractorBrowser } from 'protractor';
import * as webdriver from 'selenium-webdriver';

import { Target } from '../ui/target';

export class BrowseTheWeb implements Ability {

    private parentWindow?: string;

    /**
     *
     * Instantiates the Ability to BrowseTheWeb, allowing the Actor to interact with a Web UI
     *
     * @param browser
     * @return {BrowseTheWeb}
     */
    static using(browser: ProtractorBrowser) {
        return new BrowseTheWeb(browser);
    }

    /**
     * Used to access the Actor's ability to BrowseTheWeb from within the Interaction classes, such as Click or Enter
     *
     * @param actor
     * @return {BrowseTheWeb}
     */
    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    locate(target: Target): ElementFinder {
        return target.resolveUsing(this.browser.element);
    }

    locateAll(target: Target): ElementArrayFinder {
        return target.resolveAllUsing(this.browser.element);
    }

    takeScreenshot(): PromiseLike<string> {
        return defer(() => this.browser.takeScreenshot());
    }

    get(destination: string, timeout?: number): PromiseLike<void> {
        return this.browser.get(destination, timeout);
    }

    getTitle(): PromiseLike<string> {
        return this.browser.getTitle();
    }

    getCurrentUrl(): PromiseLike<string> {
        return this.browser.getCurrentUrl();
    }

    actions(): webdriver.ActionSequence {
        return this.browser.actions();
    }

    manage(): webdriver.Options {
        return this.browser.driver.manage();
    }

    switchToParentWindow(): PromiseLike<void> {
        if (!this.parentWindow) {
            throw new Error('This window does not have a parent');
        }
        return this.browser.switchTo().window(this.parentWindow);
    }

    acceptAlert(): PromiseLike<void> {
        return this.browser.switchTo().alert().accept();
    }

    dismissAlert(): PromiseLike<void> {
        return this.browser.switchTo().alert().dismiss();
    }

    switchToWindow(handle: (handles: string[]) => string): PromiseLike<void> {
        return this.browser.getWindowHandle().then(currentWindow => {
            this.parentWindow = currentWindow;

            return this.browser.getAllWindowHandles().then(handles => {
                return this.browser.switchTo().window(handle(handles));
            });
        });
    }

    sleep(millis: number): PromiseLike<void> {
        return defer(() => this.browser.sleep(millis));
    }

    wait(condition: webdriver.promise.Promise<any> | webdriver.until.Condition<any> | Function,
         timeout?: number,
         message?: string): PromiseLike<void> {
        return this.browser.wait(
            condition,
            timeout,
            message,
        );
    }

    enableAngularSynchronisation(enable: boolean): PromiseLike<any> {
        return this.browser.waitForAngularEnabled(enable);
    }

    executeScript(script: string | Function, ...args: any[]): PromiseLike<any> {
        return this.browser.executeScript(script, ...args.map(arg => this.resolveTargets(arg)));
    }

    executeAsyncScript(script: string | Function, ...args: any[]): PromiseLike<any> {
        return this.browser.executeAsyncScript(script, ...args.map(arg => this.resolveTargets(arg)));
    }

    constructor(private browser: ProtractorBrowser) {
    }

    private resolveTargets(maybeTarget: Target | any) {
        return maybeTarget instanceof Target
            ? maybeTarget.resolveUsing(this.browser.element)
            : maybeTarget;
    }
}
