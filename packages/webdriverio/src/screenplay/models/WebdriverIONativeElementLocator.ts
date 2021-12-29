import { format, LogicError } from '@serenity-js/core';
import { ByCss, ByCssContainingText, ById, ByTagName, ByXPath, NativeElementLocator, Selector } from '@serenity-js/web';
import { match } from 'tiny-types';
import * as wdio from 'webdriverio';

import { WebdriverIONativeElementRoot } from './WebdriverIONativeElementRoot';

const f = format({ markQuestions: false });

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
     * @param {Selector<T>} selector
     * @returns {Promise<wdio.Element<'async'>>}
     */
    async locate<T>(selector: Selector<T>): Promise<wdio.Element<'async'>> {
        const resolver = await this.resolver();

        const byLocator = match<Selector<unknown>, string>(selector)
            .when(ByCss, (s: ByCss) =>
                s.value,
            )
            .when(ByCssContainingText, (s: ByCssContainingText) =>
                `${ s.value }*=${ s.text }`,
            )
            .when(ById, (s: ById) =>
                `#${ s.value }`,
            )
            .when(ByTagName, (s: ByTagName) =>
                `<${ s.value } />`,
            )
            .when(ByXPath, (s: ByXPath) =>
                s.value,
            )
            .else(() => {
                throw new LogicError(f`Selector ${ selector } not supported`);
            });

        return resolver.$(byLocator);
    }

    async locateAll<T>(selector: Selector<T>): Promise<Array<wdio.Element<'async'>>> {
        const resolver = await this.resolver();

        const byLocator = match<Selector<unknown>, string>(selector)
            .when(ByCss, (s: ByCss) =>
                s.value,
            )
            .when(ByTagName, (s: ByTagName) =>
                `<${ s.value } />`,
            )
            .when(ByXPath, (s: ByXPath) =>
                s.value,
            )
            .else(() => {
                throw new LogicError(f`Selector ${ selector } not supported`);
            });

        return resolver.$$(byLocator);
    }
}

