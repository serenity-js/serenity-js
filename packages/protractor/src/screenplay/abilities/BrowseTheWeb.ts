import { Ability, LogicError, UsesAbilities } from '@serenity-js/core';
import { ActionSequence, ElementArrayFinder, ElementFinder, Locator, protractor, ProtractorBrowser } from 'protractor';
import { Navigation, Options } from 'selenium-webdriver';
import { promiseOf } from '../../promiseOf';

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link Actor} to interact with web front-ends using {@link protractor}.
 *
 * @example <caption>Using the protractor.browser</caption>
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
 * @implements {@link @serenity-js/core/lib/screenplay~Ability}
 */
export class BrowseTheWeb implements Ability {

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

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
     *  Interface for defining sequences of complex user interactions.
     *  Each sequence will not be executed until `perform` is called.
     *
     * @returns {external:selenium-webdriver.ActionSequence}
     */
    actions(): ActionSequence {
        return this.browser.actions();
    }

    /**
     * @desc
     *  Interface for managing browser and driver state.
     *
     * @returns {external:selenium-webdriver.Options}
     */
    manage(): Options {
        /*
        this.browser.manage().deleteCookie();
        this.browser.manage().deleteAllCookies();
        return this.browser.manage().getCookie('asd');
         */

        return this.browser.manage();
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
     *     onPrepare: function () {
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
     *  Schedules a command to execute JavaScript in the context of the currently selected frame or window.
     *  The script fragment will be executed as the body of an anonymous function.
     *  If the script is provided as a function object, that function will be converted to a string for injection
     *  into the target window.
     *
     *  Any arguments provided in addition to the script will be included as script arguments and may be referenced
     *  using the `arguments` object. Arguments may be a `boolean`, `number`, `string` or `WebElement`.
     *  Arrays and objects may also be used as script arguments as long as each item adheres
     *  to the types previously mentioned.
     *
     *  The script may refer to any variables accessible from the current window.
     *  Furthermore, the script will execute in the window's context, thus `document` may be used to refer
     *  to the current document. Any local variables will not be available once the script has finished executing,
     *  though global variables will persist.
     *
     *  If the script has a return value (i.e. if the script contains a `return` statement),
     *  then the following steps will be taken for resolving this functions return value:
     *
     *  For a HTML element, the value will resolve to a WebElement
     *  - Null and undefined return values will resolve to null
     *  - Booleans, numbers, and strings will resolve as is
     *  - Functions will resolve to their string representation
     *  - For arrays and objects, each member item will be converted according to the rules above
     *
     * @example <caption>Perform a sleep in the browser under test</caption>
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   return arguments[0].tagName;
     * `, Target.the('header').located(by.css(h1))
     *
     * @see https://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.executeScript
     * @see https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeScript-java.lang.String-java.lang.Object...-
     *
     * @param {string} description  - useful for debugging
     * @param {string | Function} script
     * @param {any[]} args
     */
    executeScript(description: string, script: string | Function, ...args: any[]) {        // tslint:disable-line:ban-types
        return promiseOf(this.browser.executeScriptWithDescription(script, description, ...args))
            .then(result => {
                this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
                    result,
                );
                return result;
            });
    }

    /**
     * @desc
     *  Schedules a command to execute asynchronous JavaScript in the context of the currently selected frame or window.
     *  The script fragment will be executed as the body of an anonymous function.
     *  If the script is provided as a function object, that function will be converted to a string for injection
     *  into the target window.
     *
     *  Any arguments provided in addition to the script will be included as script arguments and may be referenced
     *  using the `arguments` object. Arguments may be a `boolean`, `number`, `string` or `WebElement`
     *  Arrays and objects may also be used as script arguments as long as each item adheres
     *  to the types previously mentioned.
     *
     *  Unlike executing synchronous JavaScript with {@link BrowseTheWeb#executeScript},
     *  scripts executed with this function must explicitly signal they are finished by invoking the provided callback.
     *
     *  This callback will always be injected into the executed function as the last argument,
     *  and thus may be referenced with `arguments[arguments.length - 1]`.
     *
     *  The following steps will be taken for resolving this functions return value against
     *  the first argument to the script's callback function:
     *
     *  - For a HTML element, the value will resolve to a WebElement
     *  - Null and undefined return values will resolve to null
     *  - Booleans, numbers, and strings will resolve as is
     *  - Functions will resolve to their string representation
     *  - For arrays and objects, each member item will be converted according to the rules above
     *
     * @example <caption>Perform a sleep in the browser under test</caption>
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   var delay    = arguments[0];
     *   var callback = arguments[arguments.length - 1];
     *
     *   window.setTimeout(callback, delay);
     * `, 500)
     *
     * @example <caption>Return a value asynchronously</caption>
     * BrowseTheWeb.as(actor).executeAsyncScript(`
     *   var callback = arguments[arguments.length - 1];
     *
     *   callback('some return value')
     * `).then(value => doSomethingWithThe(value))
     *
     * @see https://www.protractortest.org/#/api?view=webdriver.WebDriver.prototype.executeAsyncScript
     * @see https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeAsyncScript-java.lang.String-java.lang.Object...-
     *
     * @param {string|Function} script
     * @param {any[]} args
     */
    executeAsyncScript(script: string | Function, ...args: any[]): Promise<any> {   // tslint:disable-line:ban-types
        return promiseOf(this.browser.executeAsyncScript(script, ...args))
            .then(result => {
                this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
                    result,
                );
                return result;
            });
        // todo: should I wrap this an provide additional diagnostic information? execution time? error handling?
    }

    /**
     * @desc
     *  Schedule a command to take a screenshot. The driver makes a best effort to
     *  return a base64-encoded screenshot of the following, in order of preference:
     *
     *  1. Entire page
     *  2. Current window
     *  3. Visible portion of the current frame
     *  4. The entire display containing the browser
     *
     * @return {Promise<string>} A promise that will be resolved to a base64-encoded screenshot PNG
     */
    takeScreenshot(): Promise<string> {
        return promiseOf(this.browser.takeScreenshot());
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

    getLastScriptExecutionResult(): any {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        return this.lastScriptExecutionSummary.result;
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary {
    constructor(public readonly result: any) {}
}
