import { Locator, PageElement, Selector } from '@serenity-js/web';
import { ElementFinder, Locator as ProtractorNativeLocator, ProtractorBrowser } from 'protractor';

import { unpromisedWebElement } from '../../unpromisedWebElement';
import { ProtractorPageElement } from '../ProtractorPageElement';
import { ProtractorNativeElementRoot } from './ProtractorNativeElementRoot';

export class ProtractorLocator<Selector_Type extends Selector> extends Locator<ElementFinder, ProtractorNativeElementRoot, Selector_Type> {

    static createRootLocator<ST extends Selector>(browser: ProtractorBrowser, selector: ST, protractorBy: ProtractorNativeLocator): ProtractorLocator<ST> {
        const parentRoot: ProtractorNativeElementRoot = {
            element: browser.element.bind(browser),
            all: browser.element.all.bind(browser),
        }

        return new ProtractorLocator(
            () => parentRoot,
            selector,
            (root: ProtractorNativeElementRoot) => unpromisedWebElement(root.element(protractorBy)),
            async (root: ProtractorNativeElementRoot) => root.all(protractorBy)
        );
    }

    of(parent: ProtractorLocator<unknown>): Locator<ElementFinder, ProtractorNativeElementRoot, Selector_Type> {
        return new ProtractorLocator(
            () => parent.nativeElement(),
            this.selector,
            (parentRoot: ProtractorNativeElementRoot) => this.locateElement(parentRoot),
            (parentRoot: ProtractorNativeElementRoot) => this.locateAllElements(parentRoot),
        );
    }

    element(): PageElement<ElementFinder> {
        return new ProtractorPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<ElementFinder>>> {
        const parentRoot    = await this.parentRoot()
        const elements      = await this.locateAllElements(parentRoot);

        return Promise.all(elements.map(childElement =>
            new ProtractorPageElement(new ProtractorLocator(
                this.parentRoot,
                this.selector,
                () => unpromisedWebElement(childElement),
                () => [ unpromisedWebElement(childElement) ],
            ))
        ));
    }
}
