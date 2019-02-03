import { Ability, UsesAbilities } from '@serenity-js/core';
import { ElementArrayFinder, ElementFinder, Locator, protractor, ProtractorBrowser } from 'protractor';
import { Navigation } from 'selenium-webdriver';
import { promiseOf } from '../promiseOf';

/**
 * @desc
 *  An {@link Ability} that enables the {@link Actor} to interact with web front-ends using {@link protractor}.
 *
 * @example <caption>Using a default Axios HTTP client</caption>
 * import { Actor } from '@serenity-js/core';
 * import { BrowseTheWeb, Navigate, Target } from '@serenity-js/protractor'
 * import { Ensure, equals } from '@serenity-js/assertions';
 * import { by, protractor } from 'protractor';
 *
 * const actor = Actor.named('Wendy').whoCan(
 *     BrowseTheWeb.using(protractor.browser),
 * );
 *
 * const HomePage = {
 *     Title: Target.the('title').located(by.css('h1')),
 * };
 *
 * actor.attemptsTo(
 *     Navigate.to(`https://serenity-js.org`),
 *     Ensure.that(Text.of(HomePage.Title), equals('Serenity/JS')),
 * );
 *
 * @see https://www.protractortest.org/
 *
 * @public
 * @implements {Ability}
 */
export class BrowseTheWeb implements Ability {

    /**
     * @desc
     *  Ability to interact with web front-ends using a given protractor browser instance.
     *
     * @param {ProtractorBrowser} browser
     * @returns {BrowseTheWeb}
     */
    static using(browser: ProtractorBrowser): BrowseTheWeb {
        return new BrowseTheWeb(browser);
    }

    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWeb} from within the {@link Interaction} classes,
     *  such as {@link Navigate}.
     *
     * @param {UsesAbilities} actor
     * @return {BrowseTheWeb}
     */
    static as(actor: UsesAbilities): BrowseTheWeb {
        return actor.abilityTo(BrowseTheWeb);
    }

    /**
     * @param {ProtractorBrowser} browser
     *  An instance of a protractor browser
     */
    constructor(private readonly browser: ProtractorBrowser) {
    }

    /**
     * @desc
     *  Navigate to the given destination and loads mock modules before Angular.
     *  Assumes that the page being loaded uses Angular.
     *
     * @param {string} destination
     * @param {number?} timeoutInMillis
     *
     * @returns {Promise<void>}
     */
    get(destination: string, timeoutInMillis?: number): Promise<void> {
        return promiseOf(this.browser.get(destination, timeoutInMillis));
    }

    /**
     * @desc
     *  Interface for navigating back and forth in the browser history.
     *
     *  @returns {Navigation}
     */
    navigate(): Navigation {
        return this.browser.navigate();
    }

    /**
     * @desc
     *  Locates a single element identified by the locator
     *
     * @param {Locator} locator
     * @returns {ElementFinder}
     */
    locate(locator: Locator): ElementFinder {
        return this.browser.element(locator);
    }

    /**
     * @desc
     *  Locates all elements identified by the locator
     *
     * @param {Locator} locator
     * @returns {ElementArrayFinder}
     */
    locateAll(locator: Locator): ElementArrayFinder {
        return this.browser.element.all(locator);
    }

    /**
     * @desc
     * If set to false, Protractor will not wait for Angular $http and $timeout
     * tasks to complete before interacting with the browser.
     *
     * This can be useful when:
     * - you need to switch to a non-Angular app during your tests (i.e. SSO login gateway)
     * - your app continuously polls an API with $timeout
     *
     * If you're not testing an Angular app, it's better to disable Angular synchronisation completely
     * in protractor configuration:
     *
     * @example <caption>protractor.conf.js</caption>
     * exports.config = {
     *     onPrepare: function() {
     *         return browser.waitForAngularEnabled(false);
     *     },
     *
     *     // ... other config
     * };
     *
     * @param {boolean} enable
     *
     * @returns {Promise<boolean>}
     */
    enableAngularSynchronisation(enable: boolean): Promise<boolean> {
        return promiseOf(this.browser.waitForAngularEnabled(enable));
    }

    /**
     * @desc
     *  Returns the title of the current page.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title
     *
     * @returns {Promise<string>}
     */
    getTitle(): Promise<string> {
        return promiseOf(this.browser.getTitle());
    }

    /**
     * @desc
     *  Returns the url of the current page.
     *
     * @returns {Promise<string>}
     */
    getCurrentUrl(): Promise<string> {
        return promiseOf(this.browser.getCurrentUrl());
    }

    /**
     * @desc
     *  Pause the actor flow for a specified number of milliseconds.
     *
     * @returns {Promise<void>}
     */
    sleep(millis: number): Promise<void> {
        return promiseOf(this.browser.sleep(millis));
    }

    /**
     * @desc
     *  Pause the actor flow until the condition is met or the timeout expires.
     *
     * @returns {Promise<boolean>}
     */
    wait(condition: () => Promise<boolean>, timeout: number): Promise<boolean> {
        return promiseOf(this.browser.wait(condition, timeout));
    }
}
