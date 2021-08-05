import { Question } from '@serenity-js/core';
import type { Browser, Element, ElementArray, Selector } from 'webdriverio';

import { BrowseTheWeb } from '../abilities';

/**
 * @desc
 *  Represents a way to retrieve one and multiple Web elements using a given strategy.
 *
 * @see {@link by}
 * @see {@link Locators}
 */
export class Locator {
    constructor(
        private readonly description: string,
        private readonly locateOne: (browserInstance: Browser<'async'>) => Promise<Element<'async'>>,
        private readonly locateAll: (browserInstance: Browser<'async'>) => Promise<ElementArray>,
    ) {
    }

    /**
     * @desc
     *  Returns a {@link @serenity-js/core/lib/screenplay~Question} that resolves
     *  to the first Web element found using a given strategy.
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<Promise<Element<'async'>>>}
     */
    firstMatching(): Question<Promise<Element<'async'>>> {
        return Question.about(this.description, actor =>
            this.locateOne(BrowseTheWeb.as(actor).browser)
        )
    }

    /**
     * @desc
     *  Returns a {@link @serenity-js/core/lib/screenplay~Question} that resolves
     *  to all the Web elements found using a given strategy.
     *
     * @returns {@serenity-js/core/lib/screenplay~Question<Promise<ElementArray>>}
     */
    allMatching(): Question<Promise<ElementArray>> {
        return Question.about(this.description, actor =>
            this.locateAll(BrowseTheWeb.as(actor).browser)
        )
    }
}

/**
 * @desc
 *  {@link Locator} factory. You probably want to use {@link by} instead in your tests.
 */
export class Locators {
    /**
     * @desc
     *  Locates elements by their `id` attribute.
     *
     * @example <caption>Example widget</caption>
     *  <input id="username" />
     *
     * @example
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const usernameField = Target.the('username field').located(by.id('username'));
     *
     * @param {string} id
     * @returns {Locator}
     *
     * @see {@link Target}
     * @see https://webdriver.io/docs/selectors/#id
     */
    id(id: string): Locator {
        return new Locator(
            `by id #${ id }`,
            browser => browser.$(`#${id}`) as unknown as Promise<Element<'async'>>,
            browser => browser.$$(`#${id}`),
        )
    }

    /**
     * @desc
     *  Locates elements using a CSS selector
     *
     * @example <caption>Example widget</caption>
     *  <div id="article">
     *      <h1>Title</h1>
     *      <h2>Section 1</h2>
     *      <h2>Section 2</h2>
     *  </div>
     *
     * @example <caption>Locating a single element</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const title = Target.the('article title').located(by.css('#article h1'));
     *
     * @example <caption>Locating multiple elements</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const titles = Target.all('section titles').located(by.css('#article h2'));
     *
     * @param {Selector} selector
     * @returns {Locator}
     *
     * @see {@link Target}
     * @see https://webdriver.io/docs/selectors/#css-query-selector
     */
    css(selector: Selector): Locator {
        return new Locator(
            `by css ${ selector }`,
            browser => browser.$(selector) as unknown as Promise<Element<'async'>>,
            browser => browser.$$(selector),
        )
    }

    /**
     * @desc
     *  Locates elements by HTML tag name
     *
     * @example <caption>Example widget</caption>
     *  <ul>
     *      <li>Item 1</li>
     *      <li>Item 2</li>
     *  </ul>
     *  <span>Total price: £5</span>
     *
     * @example <caption>Locating a single element</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const totalPrice = Target.the('total price').located(by.tagName('span'));
     *
     * @example <caption>Locating multiple elements</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const items = Target.all('shopping basket items').located(by.tagName('li'));
     *
     * @param {string} tagName
     * @returns {Locator}
     *
     * @see {@link Target}
     * @see https://webdriver.io/docs/selectors/#tag-name
     */
    tagName(tagName: string): Locator {
        return new Locator(
            `by tag name <${ tagName } />`,
            browser => browser.$(`<${ tagName } />`) as unknown as Promise<Element<'async'>>,
            browser => browser.$$(`<${ tagName } />`),
        )
    }

    /**
     * @desc
     *  Locates an HTML anchor element with a specific text in it.
     *
     * @example <caption>Example widget</caption>
     *  <a href="https://serenity-js.org">Serenity/JS</a>
     *
     * @example <caption>Locating a single element</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const serenityWebsite = Target.the('Serenity/JS website link').located(by.linkText('Serenity/JS'));
     *
     * @example <caption>Locating multiple elements</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const items = Target.all('Serenity/JS website links').located(by.linkText('Serenity/JS'));
     *
     * @param {string} linkText
     * @returns {Locator}
     *
     * @see {@link Target}
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
     * @see https://webdriver.io/docs/selectors/#link-text
     */
    linkText(linkText: string): Locator {
        return new Locator(
            `by link text ${ linkText }`,
            browser => browser.$(`=${ linkText }`) as unknown as Promise<Element<'async'>>,
            browser => browser.$$(`=${ linkText }`),
        )
    }

    /**
     * @desc
     *  Locates an HTML anchor element with which visible text partially matches `partialLinkText`
     *
     * @example <caption>Example widget</caption>
     *  <a href="https://serenity-js.org">Serenity/JS</a>
     *  <a href="https://serenity-bdd.info/#/">Serenity BDD</a>
     *
     * @example <caption>Locating a single element</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const serenityWebsite = Target.the('Serenity/JS website link').located(by.partialLinkText('JS'));
     *
     * @example <caption>Locating multiple elements</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const serenityWebsites = Target.all('Serenity frameworks').located(by.partialLinkText('Serenity'));
     *
     * @param {string} partialLinkText
     * @returns {Locator}
     *
     * @see {@link Target}
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
     * @see https://webdriver.io/docs/selectors/#link-text
     */
    partialLinkText(partialLinkText: string): Locator {
        return new Locator(
            `by partial link text ${ partialLinkText }`,
            browser => browser.$(`*=${ partialLinkText }`) as unknown as Promise<Element<'async'>>,
            browser => browser.$$(`*=${ partialLinkText }`),
        )
    }

    /**
     * @desc
     *  Locates elements using an [XPath](https://developer.mozilla.org/en-US/docs/Web/XPath) selector.
     *
     *  Please note that whenever possible you should use {@link Locators#id} and {@link Locators#css} locators
     *  instead of XPath to make your tests more robust.
     *
     * @example <caption>Example widget</caption>
     *  <div id="article">
     *      <h1>Title</h1>
     *      <h2>Section 1</h2>
     *      <h2>Section 2</h2>
     *  </div>
     *
     * @example <caption>Locating a single element</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const title = Target.the('article title').located(by.xpath('//*[@id="article"]/h1'));
     *
     * @example <caption>Locating multiple elements</caption>
     *  import { by, Target } from '@serenity-js/webdriverio';
     *
     *  const title = Target.the('article title').located(by.xpath('//*[@id="article"]/h2'));
     *
     * @param {string} xpath
     * @returns {Locator}
     *
     * @see {@link Target}
     * @see https://developer.mozilla.org/en-US/docs/Web/XPath
     * @see https://webdriver.io/docs/selectors/#xpath
     */
    xpath(xpath: string): Locator {
        return new Locator(
            `by xpath ${ xpath }`,
            browser => browser.$(xpath) as unknown as Promise<Element<'async'>>,
            browser => browser.$$(xpath),
        )
    }
}

export const by = new Locators();
