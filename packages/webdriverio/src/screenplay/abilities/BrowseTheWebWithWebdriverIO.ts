import { Duration, LogicError, Timestamp, UsesAbilities } from '@serenity-js/core';
import { BrowserCapabilities, BrowseTheWeb, Cookie, CookieMissingError, Key, Page, PageElement, PageElementList, PageElementLocation, PageElementLocator } from '@serenity-js/web';
import type * as wdio from 'webdriverio';

import { WebdriverIOCookie, WebdriverIOPage, WebdriverIOPageElement, WebdriverIOPageElementList, WebdriverIOPageElementLocator } from '../models';

/**
 * @desc
 *  An {@link @serenity-js/core/lib/screenplay~Ability} that enables the {@link @serenity-js/core/lib/screenplay/actor~Actor}
 *  to interact with Web apps using [WebdriverIO](https://webdriver.io/).
 *
 *  *Please note*: this class is still marked as experimental while new WebdriverIO Interactions and Questions are being developed.
 *  This means that its interface can change without affecting the major version of Serenity/JS itself.
 *  In particular, please don't rely on the `browser` field to remain `public` in future releases.
 *
 * @experimental
 *
 * @example <caption>Using the WebdriverIO browser</caption>
 *  import { Actor } from '@serenity-js/core';
 *  import { BrowseTheWeb, by, Navigate, Target } from '@serenity-js/webdriverio'
 *  import { Ensure, equals } from '@serenity-js/assertions';
 *
 *  const actor = Actor.named('Wendy').whoCan(
 *      BrowseTheWeb.using(browser),
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
 * @see https://webdriver.io/
 *
 * @public
 * @implements {@serenity-js/core/lib/screenplay~Ability}
 * @see {@link @serenity-js/core/lib/screenplay/actor~Actor}
 */
export class BrowseTheWebWithWebdriverIO extends BrowseTheWeb {
    private $:  PageElementLocator<wdio.Element<'async'>>;
    private $$: PageElementLocator<wdio.ElementArray>;

    /**
     * @private
     */
    private lastScriptExecutionSummary: LastScriptExecutionSummary;

    /**
     * @param {@wdio/types~Browser} browserInstance
     * @returns {BrowseTheWebWithWebdriverIO}
     */
    static using(browserInstance: wdio.Browser<'async'>): BrowseTheWebWithWebdriverIO {
        return new BrowseTheWebWithWebdriverIO(browserInstance);
    }

    /**
     * @desc
     *  Used to access the Actor's ability to {@link BrowseTheWebWithWebdriverIO}
     *  from within the {@link @serenity-js/core/lib/screenplay~Interaction} classes,
     *  such as {@link @serenity-js/web/lib/screenplay/interactions~Navigate}.
     *
     * @param {@serenity-js/core/lib/screenplay/actor~UsesAbilities} actor
     * @return {BrowseTheWebWithWebdriverIO}
     */
    static as(actor: UsesAbilities): BrowseTheWebWithWebdriverIO {
        return actor.abilityTo(BrowseTheWebWithWebdriverIO);
    }

    /**
     * @param {@wdio/types~Browser} browser
     */
    constructor(public readonly browser: wdio.Browser<'async'>) {
        super();

        if (! this.browser.$ || ! this.browser.$$) {
            throw new LogicError(`WebdriverIO browser object is not initalised yet, so can't be assigned to an actor. Are you trying to instantiate an actor outside of a test or a test hook?`)
        }

        this.$  = new WebdriverIOPageElementLocator(this.browser.$.bind(this.browser) as unknown as (selector: string) => Promise<wdio.Element<'async'>>);
        this.$$ = new WebdriverIOPageElementLocator(this.browser.$$.bind(this.browser));
    }

    /**
     * @desc
     *  Navigate to a given destination, specified as an absolute URL
     *  or a path relative to WebdriverIO `baseUrl`.
     *
     * @param {string} destination
     * @returns {Promise<void>}
     */
    navigateTo(destination: string): Promise<void> {
        return this.browser.url(destination) as any;  // todo: check if this returns a string or is mistyped
    }

    navigateBack(): Promise<void> {
        return this.browser.back();
    }

    navigateForward(): Promise<void> {
        return this.browser.forward();
    }

    reloadPage(): Promise<void> {
        return this.browser.refresh();
    }

    getTitle(): Promise<string> {
        return this.browser.getTitle();
    }

    getCurrentUrl(): Promise<string> {
        return this.browser.getUrl();
    }

    getBrowserCapabilities(): Promise<BrowserCapabilities> {
        return Promise.resolve(this.browser.capabilities as BrowserCapabilities);
    }

    locateElementAt(location: PageElementLocation): Promise<PageElement> {
        return this.$.locate(location)
            .then(element => new WebdriverIOPageElement(this.browser, element, location));
    }

    locateAllElementsAt(location: PageElementLocation): Promise<PageElementList> {
        return this.$$.locate(location)
            .then(elements => new WebdriverIOPageElementList(this.browser, elements, location));
    }

    async getCookie(name: string): Promise<Cookie> {
        const [ cookie ] = await this.browser.getCookies(name);

        if (! cookie) {
            throw new CookieMissingError(`Cookie '${ name }' not set`);
        }

        // There _might_ be a bug in WDIO where the expiry date is set on "expires" rather than the "expiry" key
        // and possibly another one around deserialising the timestamp, since WDIO seems to add several hundred milliseconds
        // to the original expiry date
        const expiry: number | undefined = cookie.expiry || (cookie as any).expires;

        return new WebdriverIOCookie(
            this.browser,
            name,
            cookie.value,
            cookie.domain,
            cookie.path,
            expiry !== undefined ? Timestamp.fromTimestampInSeconds(Math.round(expiry)) : undefined,
            cookie.httpOnly,
            cookie.secure,
        );
    }

    deleteAllCookies(): Promise<void> {
        return this.browser.deleteCookies() as Promise<void>;
    }

    async getCurrentPage(): Promise<Page> {

        const windowHandle = await this.browser.getWindowHandle();

        // todo: wrap in proxy
        return new WebdriverIOPage(this.browser, windowHandle);
    }

    async getPageCalled(nameOrHandleOrIndex: string | number): Promise<Page> {

        // const windowHandles = await this.browser.getWindowHandle();

        // return new WebdriverIOPage(this.browser, windowHandle);
        throw new Error('Not implemented, yet');
    }

    // todo: remove
    switchToFrame(targetOrIndex: PageElement | number | string): Promise<void> {
        throw new Error('Not implemented, yet');
    }
    // todo: remove
    switchToParentFrame(): Promise<void> {
        throw new Error('Not implemented, yet');
    }
    // todo: remove
    switchToDefaultContent(): Promise<void> {
        throw new Error('Not implemented, yet');
    }
    // todo: remove
    switchToWindow(nameOrHandleOrIndex: string | number): Promise<void> {
        throw new Error('Not implemented, yet');
    }
    // todo: remove
    switchToOriginalWindow(): Promise<void> {
        throw new Error('Not implemented, yet');
    }
    // todo: remove
    getCurrentWindowHandle(): Promise<string> {
        throw new Error('Not implemented, yet');
    }
    // todo: remove
    getAllWindowHandles(): Promise<string[]> {
        throw new Error('Not implemented, yet');
    }
    // todo: remove
    closeCurrentWindow(): Promise<void> {
        throw new Error('Not implemented, yet');
    }

    /**
     * @desc
     *  Send a sequence of {@link Key} strokes to the active element.
     *
     * @param {Array<Key | string>} keys
     *  Keys to enter
     *
     * @returns {Promise<void>}
     *
     * @see https://webdriver.io/docs/api/browser/keys/
     */
    sendKeys(keys: Array<Key | string>): Promise<void> {
        const keySequence = keys.map(key => {
            if (! Key.isKey(key)) {
                return key;
            }

            if (this.browser.isDevTools) {
                return key.devtoolsName;
            }

            return key.utf16codePoint;
        });

        return this.browser.keys(keySequence);
    }

    /**
     * @desc
     *  Take a screenshot of the top-level browsing context's viewport.
     *
     * @return {Promise<string>}
     *  A promise that will resolve to a base64-encoded screenshot PNG
     */
    takeScreenshot(): Promise<string> {
        return this.browser.takeScreenshot();
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
     * @see https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeScript-java.lang.String-java.lang.Object...-
     *
     * @param {string | Function} script
     * @param {any[]} args
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    executeScript<Result, InnerArguments extends any[]>(
        script: string | ((...parameters: InnerArguments) => Result),
        ...args: InnerArguments
    ): Promise<Result> {
        const nativeArguments = args.map(arg => arg instanceof WebdriverIOPageElement ? arg.nativeElement() : arg) as InnerArguments;

        return this.browser.execute(script, ...nativeArguments)
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
     *  Unlike executing synchronous JavaScript with {@link BrowseTheWebWithWebdriverIO#executeScript},
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
     * @see https://seleniumhq.github.io/selenium/docs/api/java/org/openqa/selenium/JavascriptExecutor.html#executeAsyncScript-java.lang.String-java.lang.Object...-
     *
     * @param {string|Function} script
     * @param {any[]} args
     *
     * @returns {Promise<any>}
     *
     * @see {@link BrowseTheWeb#getLastScriptExecutionResult}
     */
    executeAsyncScript<Result, Parameters extends any[]>(
        script: string | ((...args: [...parameters: Parameters, callback: (result: Result) => void]) => void),
        ...args: Parameters
    ): Promise<Result> {
        const nativeArguments = args.map(arg => arg instanceof WebdriverIOPageElement ? arg.nativeElement() : arg) as Parameters;

        return this.browser.executeAsync<Result, Parameters>(script, ...nativeArguments)
            .then(result => {
                this.lastScriptExecutionSummary = new LastScriptExecutionSummary<Result>(
                    result,
                );
                return result;
            });
    }

    /**
     * @desc
     *  Returns the last result of calling {@link BrowseTheWebWithWebdriverIO#executeAsyncScript}
     *  or {@link BrowseTheWebWithWebdriverIO#executeScript}
     *
     * @returns {any}
     */
    getLastScriptExecutionResult<Result = any>(): Result {
        if (! this.lastScriptExecutionSummary) {
            throw new LogicError(`Make sure to execute a script before checking on the result`);
        }

        // Selenium returns `null` when the script it executed returns `undefined`
        // so we're mapping the result back.
        return this.lastScriptExecutionSummary.result !== null
            ? this.lastScriptExecutionSummary.result as Result
            : undefined;
    }

    waitFor(duration: Duration): Promise<void> {
        return this.browser.pause(duration.inMilliseconds()) as Promise<void>;
    }

    waitUntil(condition: () => boolean | Promise<boolean>, timeout: Duration): Promise<void>  {
        return this.browser.waitUntil(condition, {
            timeout:    timeout.inMilliseconds(),
            timeoutMsg: `Wait timed out after ${ timeout }`,
        }) as Promise<void>;
    }
}

/**
 * @package
 */
class LastScriptExecutionSummary<Result = any> {
    constructor(public readonly result: Result) {}
}
