import { Locator, PageElement, Selector } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIOPageElement } from '../WebdriverIOPageElement';
import { WebdriverIONativeElementRoot } from './WebdriverIONativeElementRoot';

export class WebdriverIOLocator<Selector_Type extends Selector> extends Locator<wdio.Element<'async'>, WebdriverIONativeElementRoot, Selector_Type> {

    static createRootLocator<ST extends Selector>(browser: WebdriverIONativeElementRoot, selector: ST, webdriverioSelector: string): WebdriverIOLocator<ST> {
        return new WebdriverIOLocator(
            () => browser,
            selector,
            (root: WebdriverIONativeElementRoot) => root.$(webdriverioSelector) as unknown as wdio.Element<'async'>,
            (root: WebdriverIONativeElementRoot) => root.$$(webdriverioSelector)
        );
    }

    of(parent: WebdriverIOLocator<unknown>): Locator<wdio.Element<'async'>, WebdriverIONativeElementRoot, Selector_Type> {
        return new WebdriverIOLocator(
            () => parent.nativeElement(),
            this.selector,
            (parentRoot: WebdriverIONativeElementRoot) => this.locateElement(parentRoot),
            (parentRoot: WebdriverIONativeElementRoot) => this.locateAllElements(parentRoot),
        );
    }

    element(): PageElement<wdio.Element<'async'>> {
        return new WebdriverIOPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<wdio.Element<'async'>>>> {
        const elements = await this.locateAllElements(await this.parentRoot());

        return elements.map(childElement =>
            new WebdriverIOPageElement(new WebdriverIOLocator(
                () => this.parentRoot(),
                this.selector,
                () => childElement,
                () => [ childElement ],
            ))
        );
    }
}
