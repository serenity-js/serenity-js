import { Ability, ConfigurationError, LogicError, UsesAbilities } from '@serenity-js/core';
import { ActionSequence, ElementArrayFinder, ElementFinder, Locator, ProtractorBrowser } from 'protractor';
import { AlertPromise, Capabilities, Navigation, Options, WebElement } from 'selenium-webdriver';
import { promiseOf } from '../../promiseOf';

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
export class BrowseTheWeb implements Ability {

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    /**
     * @private
     */
    private originalWindowHandle: string;

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
    constructor(protected browser: ProtractorBrowser) {
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
        return promiseOf(this.browser.get(destination, timeoutInMillis)
            .then(() => this.browser.getWindowHandle())
            .then(handle => {
                this.originalWindowHandle = handle;
            }),
        );
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
     * @returns {ActionSequence}
     *
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/actions.html
     */
    actions(): ActionSequence {
        return this.browser.actions();
    }

    /**
     * @desc
     *  Interface for managing browser and driver state.
     *
     * @returns {Options}
     *
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebDriver.html#manage
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
     *  Changes focus to the active modal dialog,
     *  such as those opened by
     *  [`Window.alert()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert),
     *  [`Window.prompt()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt), or
     *  [`Window.confirm()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm).
     *
     * The returned promise will be rejected with an [`error.NoSuchAlertError`](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/error_exports_NoSuchAlertError.html)
     * if there are no open alerts.
     *
     * @returns {AlertPromise}
     *
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_TargetLocator.html#alert
     */
    alert(): AlertPromise {
        return this.browser.switchTo().alert();
    }

    /**
     * @desc
     *  Switches the focus to a [`frame`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/frame) or
     *  [`iframe`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) identified by `elementOrIndexOrName`,
     *  which can be specified either as {@link selenium-webdriver~WebElement}, the name of the frame, or its index.
     *
     * @param {number | string | WebElement} elementOrIndexOrName
     *
     * @returns {Promise<void>}
     */
    switchToFrame(elementOrIndexOrName: number | string | WebElement): Promise<void> {
        // incorrect type definition in selenium-webdriver prevents us from providing a string arg
        return promiseOf(this.browser.switchTo().frame(elementOrIndexOrName as any));
    }

    /**
     * @desc
     *  Switches the focus from any [`frame`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/frame) or
     *  [`iframe`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) back to its parent iframe.
     *
     * @returns {Promise<void>}
     */
    switchToParentFrame(): Promise<void> {
        return promiseOf(this.browser.driver.switchToParentFrame());
    }

    /**
     * @desc
     *  Switches the focus from any [`frame`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/frame)
     *  or [`iframe`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) back to default content,
     *  a.k.a. "the main window".
     *
     * @returns {Promise<void>}
     */
    switchToDefaultContent(): Promise<void> {
        return promiseOf(this.browser.switchTo().defaultContent());
    }

    /**
     * @desc
     *  Switches browser window/tab to the one identified by `nameOrHandleOrIndex`,
     *  which can be specified as the name of the window to switch to, its handle, or numeric index.
     *
     * @param {string | number} nameOrHandleOrIndex
     *
     * @returns {Promise<void>}
     */
    switchToWindow(nameOrHandleOrIndex: string | number): Promise<void> {
        return typeof nameOrHandleOrIndex === 'string'
            ? this.switchToWindowByNameOrHandle(nameOrHandleOrIndex)
            : this.switchToWindowByIndex(nameOrHandleOrIndex);
    }

    /**
     * @param {string} nameOrHandle
     * @private
     */
    private switchToWindowByNameOrHandle(nameOrHandle: string): Promise<void> {
        return promiseOf(this.browser.switchTo().window(nameOrHandle));
    }

    /**
     * @param {number} index
     * @private
     */
    private switchToWindowByIndex(index: number): Promise<void> {
        return promiseOf(this.browser.getAllWindowHandles().then(handles => {
            const handle = handles[index];

            if (! handle) {
                throw new LogicError(`Window ${ index } doesn't exist`)
            }

            return this.browser.switchTo().window(handle);
        }));
    }

    /**
     * @desc
     *  Switches the window back to the original one that was used to call {@link get}.
     *
     * @returns {Promise<void>}
     */
    switchToOriginalWindow(): Promise<void> {
        return this.originalWindowHandle
            ? promiseOf(this.browser.switchTo().window(this.originalWindowHandle))
            : Promise.resolve();
    }

    /**
     * @desc
     *  Returns the handle of the browser window last used to navigate to a URL.
     *
     * @returns {Promise<string>}
     *  A window handle
     *
     * @see {@link get}
     */
    getOriginalWindowHandle(): Promise<string> {
        return Promise.resolve(this.originalWindowHandle);
    }

    /**
     * @desc
     *  Returns the current window handle.
     *  Please note that the current handle changes with each browser window you {@link Switch} to.
     *
     * @returns {Promise<string>}
     *  A window handle
     *
     * @see {@link get}
     */
    getCurrentWindowHandle(): Promise<string> {
        return promiseOf(this.browser.getWindowHandle());
    }

    /**
     * @desc
     *  Returns the handles of all the available windows.
     *
     *  Please note that while some browsers organise entries of this list in the same order
     *  new windows have been spawned, other browsers order it alphabetically.
     *  For this reason, you should not make any assumptions about how this list is ordered.
     *
     * @returns {Promise<string[]>}
     *  A list of window handles
     */
    getAllWindowHandles(): Promise<string[]> {
        return promiseOf(this.browser.getAllWindowHandles());
    }

    /**
     * @desc
     *  Closes the currently active browser window/tab.
     *
     * @returns {Promise<void>}
     */
    closeCurrentWindow(): Promise<void> {
        return promiseOf(this.browser.close());
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
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    executeScript(description: string, script: string | Function, ...args: any[]): Promise<any> {   // eslint-disable-line @typescript-eslint/ban-types
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
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    executeAsyncScript(script: string | Function, ...args: any[]): Promise<any> {   // eslint-disable-line @typescript-eslint/ban-types
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
     *  Returns the  capabilities of the browser used in the current session.
     *
     *  By default, the session `capabilities` specified in the `protractor.conf.js`
     *  indicate the _desired_ properties of the remote browser. However, if the remote cannot satisfy
     *  all the requirements, it will still create a session.
     *
     * @returns {Promise<Capabilities>} The actual capabilities of this browser.
     */
    getCapabilities(): Promise<Capabilities> {
        return promiseOf(this.browser.getCapabilities());
    }

    /**
     * @desc
     *  Pause the actor flow for a specified number of milliseconds.
     *
     * @param {number} millis
     * @returns {Promise<void>}
     */
    sleep(millis: number): Promise<void> {
        return promiseOf(this.browser.sleep(millis));
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
        return promiseOf(this.browser.wait(condition, timeoutInMillis));
    }

    /**
     * @desc
     *  Returns the last result of calling {@link BrowseTheWeb#executeAsyncScript}
     *  or {@link BrowseTheWeb#executeScript}
     *
     * @returns {any}
     */
    getLastScriptExecutionResult(): any {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        return this.lastScriptExecutionSummary.result;
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
