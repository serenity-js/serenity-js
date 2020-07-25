import { promise } from 'selenium-webdriver';

/**
 * @desc
 *  Represents a [WebElement](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html),
 *  [ElementFinder](https://www.protractortest.org/#/api?view=ElementFinder)
 *  or a {@link ModalDialog}.
 *
 * @see {@link Enter}
 * @see {@link Text}
 *
 * @public
 */
export interface HasText {

    /**
     * @desc
     *  Get the visible (i.e. not hidden by CSS) innerText of this element,
     *  including sub-elements, without any leading or trailing whitespace.
     *
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html#getText
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_AlertPromise.html#getText
     *
     * @type {function(): Promise<String>}
     */
    getText: () => promise.Promise<string>;

    /**
     * @desc
     *  Types a key sequence on the DOM element represented by this instance.
     *
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElement.html#sendKeys
     * @see https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_AlertPromise.html#sendKeys
     *
     * @type {function(text: string): Promise<String>}
     */
    sendKeys: (text: string) => promise.Promise<void>;
}
