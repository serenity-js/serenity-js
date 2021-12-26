import { LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ById, ByTagName, ByXPath, NativeElementLocator, Selector } from '@serenity-js/web';
import * as wdio from 'webdriverio';
import { WebdriverIONativeElementRoot } from './WebdriverIONativeElementRoot';

export class WebdriverIONativeElementLocator implements NativeElementLocator<wdio.Element<'async'>> {
    constructor(private readonly resolver: () => Promise<WebdriverIONativeElementRoot> | WebdriverIONativeElementRoot) {
    }

    /**
     * @desc
     *  Retrieves a {@link @serenity-js/web/lib/screenplay/models~PageElement} which text includes `text`
     *  and which can be located using the CSS `selector`.
     *
     *  Under the hood, this command uses https://webdriver.io/docs/selectors#element-with-certain-text
     *
     *  This means that only some selectors are supported. For example:
     *  - 'h1'
     *  - 'h1.some-class'
     *  - '#someId'
     *  - 'h1[attribute-name="attribute-selector"]
     *
     *  Notably, complex CSS selectors such as 'header h1' or 'header > h1' **WON'T WORK**.
     *
     * @param {string} selector
     * @param {string} text
     * @returns {@serenity-js/web/lib/screenplay/models~PageElement}
     */
    async locate<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<wdio.Element<'async'>> {
        const resolver = await this.resolver();
        if (selector instanceof ByCss) {
            return resolver.$(selector.parameters[0]);
        }

        if (selector instanceof ByCssContainingText) {
            return resolver.$(`${ selector.parameters[0] }*=${ selector.parameters[1] }`);
        }

        if (selector instanceof ById) {
            return resolver.$(`#${selector.parameters[0]}`);
        }

        if (selector instanceof ByTagName) {
            return resolver.$(`<${ selector.parameters[0] } />`);
        }

        if (selector instanceof ByXPath) {
            return resolver.$(selector.parameters[0]);
        }

        throw new LogicError(`Selector ${ selector } not supported`);
    }

    async locateAll<Parameters extends unknown[]>(selector: Selector<Parameters>): Promise<Array<wdio.Element<'async'>>> {
        const resolver = await this.resolver();

        if (selector instanceof ByCss) {
            return resolver.$$(selector.parameters[0])
                .map(element => element);
        }

        if (selector instanceof ByTagName) {
            return resolver.$$(`<${ selector.parameters[0] } />`)
                .map(element => element);
        }

        if (selector instanceof ByXPath) {
            return resolver.$$(selector.parameters[0])
                .map(element => element);
        }

        throw new LogicError(`Selector ${ selector } not supported`);
    }
}
