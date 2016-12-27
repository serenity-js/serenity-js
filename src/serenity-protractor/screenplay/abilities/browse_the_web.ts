import { defer } from '../../../serenity/recording/async';
import { Ability, UsesAbilities } from '../../../serenity/screenplay';
import { Target } from '../ui/target';

import { ElementArrayFinder, ElementFinder, ProtractorBrowser } from 'protractor';

import * as webdriver from 'selenium-webdriver';

export class BrowseTheWeb implements Ability {

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
        return target.resolveAllUsing(<any> this.browser.element);      // see: https://github.com/angular/protractor/issues/3350
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

    actions(): webdriver.ActionSequence {
        return this.browser.actions();
    }

    manage(): webdriver.Options {
        return this.browser.driver.manage();
    }

    sleep(millis: number): PromiseLike<void> {
        return defer(() => this.browser.sleep(millis));
    }

    wait(condition: webdriver.promise.Promise<any> | webdriver.until.Condition<any> | Function,
         timeout?: number,
         message?: string): PromiseLike<void>
    {
        return this.browser.wait(
            condition,
            timeout,
            message,
        );
    }

    constructor(private browser: ProtractorBrowser) {
    }
}
