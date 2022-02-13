import { ConfigurationError, Duration, LogicError } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb, ByCss, ByCssContainingText, ById, ByTagName, ByXPath, Cookie, CookieData, Frame, Key, ModalDialog, Page, Selector } from '@serenity-js/web';
import { by, ElementFinder, ProtractorBrowser } from 'protractor';
import { Capabilities } from 'selenium-webdriver';

import { ProtractorCookie, ProtractorFrame, ProtractorModalDialog, ProtractorPage, ProtractorPageElement } from '../models';
import { ProtractorLocator, ProtractorNativeElementRoot } from '../models/locators';
import { promised } from '../promised';

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link Actor} to interact with web front-ends using {@link protractor}.
 *
 * @example <caption>Using the protractor.browser</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { BrowseTheWeb, Navigate, Target } from '@serenity-js/protractor'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *  import { by, protractor } from 'protractor';
 *
 *  const actor = Actor.named('Wendy').whoCan(
 *      BrowseTheWeb.using(protractor.browser),
 *  );
 *
 *  const HomePage = {
 *      Title: Target.the('title').located(by.css('h1')),
 *  };
 *
 *  actor.attemptsTo(
 *      Navigate.to(`https://serenity-js.org`),
 *      Ensure.that(Text.of(HomePage.Title), equals('Serenity/JS')),
 *  );
 *
 * @see https://www.protractortest.org/
 *
 * @public
 * @implements {@serenity-js/core/lib/screenplay~Ability}
 * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
 */
export class BrowseTheWebWithProtractor extends BrowseTheWeb<ElementFinder, ProtractorNativeElementRoot> {

    /**
     * @desc
     *  Ability to interact with web front-ends using a given protractor browser instance.
     *
     * @param {ProtractorBrowser} browser
     * @returns {BrowseTheWebWithProtractor}
     */
    static using(browser: ProtractorBrowser): BrowseTheWebWithProtractor {
        return new BrowseTheWebWithProtractor(browser);
    }

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    /**
     * @param {ProtractorBrowser} browser
     *  An instance of a protractor browser
     */
    constructor(protected browser: ProtractorBrowser) {
        super(new Map()
            .set(ByCss,                 (selector: ByCss)               =>
                // todo: this is a temporary experiment; target state is for all CSS selectors to support Shadow DOM by default
                ProtractorLocator.createRootLocator(this.browser, selector,
                    selector.value.startsWith('>>>') && !! by.shadowDomCss
                        ? by.shadowDomCss(selector.value.replace('>>>', ''))
                        : by.css(selector.value))
            )
            .set(ByCssContainingText,   (selector: ByCssContainingText) => ProtractorLocator.createRootLocator(this.browser, selector, by.cssContainingText(selector.value, selector.text)))
            .set(ById,                  (selector: ById)                => ProtractorLocator.createRootLocator(this.browser, selector, by.id(selector.value)))
            .set(ByTagName,             (selector: ByTagName)           => ProtractorLocator.createRootLocator(this.browser, selector, by.tagName(selector.value)))
            .set(ByXPath,               (selector: ByXPath)             => ProtractorLocator.createRootLocator(this.browser, selector, by.xpath(selector.value)))
        );
    }

    async browserCapabilities(): Promise<BrowserCapabilities> {
        const capabilities = await promised(this.browser.getCapabilities());

        return {
            platformName:   capabilities.get('platform'),
            browserName:    capabilities.get('browserName'),
            browserVersion: capabilities.get('version'),
        };
    }

    async cookie(name: string): Promise<Cookie> {
        return new ProtractorCookie(this.browser, name);
    }

    async setCookie(cookieData: CookieData): Promise<void> {
        return promised(this.browser.manage().addCookie({
            name:       cookieData.name,
            value:      cookieData.value,
            path:       cookieData.path,
            domain:     cookieData.domain,
            secure:     cookieData.secure,
            httpOnly:   cookieData.httpOnly,
            expiry:     cookieData.expiry
                ? cookieData.expiry.toSeconds()
                : undefined,
        }));
    }

    deleteAllCookies(): Promise<void> {
        return promised(this.browser.manage().deleteAllCookies());
    }

    navigateTo(destination: string): Promise<void> {
        return promised(this.browser.get(destination));
    }

    navigateBack(): Promise<void> {
        return promised(this.browser.navigate().back());
    }

    navigateForward(): Promise<void> {
        return promised(this.browser.navigate().forward());
    }

    reloadPage(): Promise<void> {
        return promised(this.browser.navigate().refresh());
    }

    waitFor(duration: Duration): Promise<void> {
        return promised(this.browser.sleep(duration.inMilliseconds()));
    }

    waitUntil(condition: () => boolean | Promise<boolean>, timeout: Duration): Promise<void> {
        return promised(this.browser.wait(condition, timeout.inMilliseconds())) as unknown as Promise<void>;
    }

    async sendKeys(keys: (string | Key)[]): Promise<void> {
        function isModifier(maybeKey: string | Key): boolean {
            return Key.isKey(maybeKey) && maybeKey.isModifier;
        }

        function asCodePoint(maybeKey: string | Key): string {
            if (! Key.isKey(maybeKey)) {
                return maybeKey;
            }

            return maybeKey.utf16codePoint;
        }

        // keyDown for any modifier keys and sendKeys otherwise
        const keyDownActions = keys.reduce((actions, key) => {
            return isModifier(key)
                ? actions.keyDown(asCodePoint(key))
                : actions.sendKeys(asCodePoint(key))
        }, this.browser.actions());

        // keyUp for any modifier keys, ignore for regular keys
        const keyUpActions = keys.reduce((actions, key) => {
            return isModifier(key)
                ? actions.keyUp(asCodePoint(key))
                : actions;
        }, keyDownActions);

        return promised(keyUpActions.perform());
    }

    async modalDialog(): Promise<ModalDialog> {
        return new ProtractorModalDialog(this.browser);
    }

    async frame(bySelector: Selector): Promise<Frame> {
        const locator = this.locate(bySelector);

        return new ProtractorFrame(this.browser, locator);
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
        return promised(this.browser.get(destination, timeoutInMillis));
    }

    /**
     * @desc
     *  Returns a {@link Page} representing the currently active top-level browsing context.
     *
     * @returns {Promise<Page>}
     */
    async currentPage(): Promise<Page> {

        const windowHandle = await this.browser.getWindowHandle();

        return new ProtractorPage(this.browser, windowHandle);
    }

    /**
     * @desc
     *  Returns an array of {@link Page} objects representing all the available
     *  top-level browsing context, e.g. all the open browser tabs.
     *
     * @returns {Promise<Array<Page>>}
     */
    async allPages(): Promise<Array<Page>> {
        const windowHandles = await this.browser.getAllWindowHandles();

        return windowHandles.map(windowHandle => new ProtractorPage(this.browser, windowHandle));
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
        return promised(this.browser.waitForAngularEnabled(enable));
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
     * @param {string | Function} script
     * @param {any[]} args
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    async executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result> {
        const nativeArguments = await Promise.all(args.map(arg => arg instanceof ProtractorPageElement ? arg.nativeElement() : arg)) as InnerArguments;

        return promised(this.browser.executeScript(script, ...nativeArguments))
            .then(result => {
                this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
                    result,
                );
                return result;
            }) as Promise<Result>;
    }

    /**
     * @desc
     *  A simplified version of {@link BrowseTheWebWithProtractor#executeScript} that doesn't affect {@link LastScriptExecution.result()}.
     *
     * @param {Function} fn
     * @param {Parameters<fn>} args
     *
     * @returns {Promise<ReturnType<fn>>}
     */
    async executeFunction<F extends (...args: any[]) => any>(fn: F, ...args: Parameters<F>): Promise<ReturnType<F>> {
        const nativeArguments = await Promise.all(args.map(arg => arg instanceof ProtractorPageElement ? arg.nativeElement() : arg)) as Parameters<F>;

        return promised(this.browser.executeScriptWithDescription(fn, fn.name, ...nativeArguments));
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
     *  Unlike executing synchronous JavaScript with {@link BrowseTheWebWithProtractor#executeScript},
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
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    async executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [...parameters: Parameters, callback: (result: Result) => void]) => void),
        ...args: Parameters
    ): Promise<Result> {
        const nativeArguments = await Promise.all(args.map(arg => arg instanceof ProtractorPageElement ? arg.nativeElement() : arg)) as Parameters;

        return promised(this.browser.executeAsyncScript(script, ...nativeArguments))
            .then(result => {
                this.lastScriptExecutionSummary = new LastScriptExecutionSummary(
                    result,
                );
                return result;
            }) as Promise<Result>;
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
        return promised(this.browser.takeScreenshot());
    }

    /**
     * @desc
     *  Returns the  capabilities of the browser used in the current session.
     *
     *  By default, the session `capabilities` specified in the `protractor.conf.js`
     *  indicate the _desired_ properties of the remote browser. However, if the remote cannot satisfy
     *  all the requirements, it will still create a session.
     *
     * @returns {Promise<Capabilities>} The actual capabilities of this browser.
     */
    capabilities(): Promise<Capabilities> {
        return promised(this.browser.getCapabilities());
    }

    /**
     * @desc
     *  Pause the actor flow for a specified number of milliseconds.
     *
     * @param {number} millis
     * @returns {Promise<void>}
     */
    sleep(millis: number): Promise<void> {
        return promised(this.browser.sleep(millis));
    }

    /**
     * @desc
     *  Pause the actor flow until the condition is met or the timeout expires.
     *
     * @param {function(): Promise<boolean>} condition
     * @param {number} timeoutInMillis
     * @returns {Promise<boolean>}
     */
    wait(condition: () => Promise<boolean>, timeoutInMillis: number): Promise<boolean> {
        return promised(this.browser.wait(condition, timeoutInMillis));
    }

    /**
     * @desc
     *  Returns the last result of calling {@link BrowseTheWebWithProtractor#executeAsyncScript}
     *  or {@link BrowseTheWebWithProtractor#executeScript}
     *
     * @returns {any}
     */
    lastScriptExecutionResult(): any {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        // Selenium 3 returns `null` when the script it executed returns `undefined`
        // so we're mapping the result back.
        return this.lastScriptExecutionSummary.result !== null
            ? this.lastScriptExecutionSummary.result
            : undefined;
    }

    /**
     * @desc
     *  Returns Protractor configuration parameter at `path`.
     *
     * @example <caption>protractor.conf.js</caption>
     *  exports.config = {
     *    params: {
     *        login: {
     *            username: 'jane@example.org'
     *            password: process.env.PASSWORD
     *        }
     *    }
     *    // ...
     * }
     *
     * @example <caption>Retrieving config param by name</caption>
     *  BrowseTheWeb.as(actor).param('login') // returns object with username and password
     *
     * @example <caption>Retrieving config param by path</caption>
     *  BrowseTheWeb.as(actor).param('login.username') // returns string 'jane@example.org'
     *
     * @param {string} path
     *  Either a name or a dot-delimited path to the param.
     *
     * @returns {T}
     *
     * @throws {@serenity-js/core/lib/errors~ConfigurationError}
     *  Throws a `ConfigurationError` if the parameter is `undefined`
     */
    param<T = any>(path: string): T {
        return path.split('.')
            .reduce((config, segment) => {
                if (! (config && config[segment] !== undefined)) {
                    throw new ConfigurationError(`Protractor param '${ path }' is undefined`);
                }

                return config[segment];
            }, this.browser.params);
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary {
    constructor(public readonly result: any) {}
}
