import { PageElement, PageElementList, PageElementLocation, PageElementLocator } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIOElementList } from './WebdriverIOElementList';
import { WebdriverIOElementLocator } from './WebdriverIOElementLocator';

export class WebdriverIOElement implements PageElement {
    private readonly $:  PageElementLocator<wdio.Element<'async'>>;
    private readonly $$: PageElementLocator<wdio.ElementArray>;

    constructor(
        private readonly browser: wdio.Browser<'async'>,
        private readonly element: wdio.Element<'async'>,
        private readonly elementLocation: PageElementLocation,
    ) {
        this.$  = new WebdriverIOElementLocator(this.element.$.bind(this.element) as unknown as (selector: string) => Promise<wdio.Element<'async'>>);
        this.$$ = new WebdriverIOElementLocator(this.element.$$.bind(this.element));
    }

    nativeElement(): any {
        return this.element;
    }

    location(): PageElementLocation {
        return this.elementLocation;
    }

    locateChildElement(location: PageElementLocation): Promise<PageElement> {
        return this.$
            .locate(location)
            .then(element => new WebdriverIOElement(this.browser, element, location));
    }

    locateAllChildElements(location: PageElementLocation): Promise<PageElementList> {
        return this.$$
            .locate(location)
            .then(elements => new WebdriverIOElementList(this.browser, elements, location));
    }

    clearValue(): Promise<void> {
        return this.element.clearValue();
    }

    click(): Promise<void> {
        return this.element.click();
    }

    doubleClick(): Promise<void> {
        return this.element.doubleClick();
    }

    enterValue(value: string | number | Array<string | number>): Promise<void> {
        return this.element.addValue(value);
    }

    scrollIntoView(): Promise<void> {
        return this.element.scrollIntoView();
    }

    hoverOver(): Promise<void> {
        return this.element.moveTo();
    }

    rightClick(): Promise<void> {
        return this.element.click({ button: 'right' });
    }

    getAttribute(name: string): Promise<string> {
        return this.element.getAttribute(name);
    }

    getText(): Promise<string> {
        return this.element.getText();
    }

    getValue(): Promise<string> {
        return this.element.getValue();
    }

    isActive(): Promise<boolean> {
        return this.element.isFocused();
    }

    isClickable(): Promise<boolean> {
        return this.element.isClickable();
    }

    isDisplayed(): Promise<boolean> {
        return this.element.isDisplayed();
    }

    isEnabled(): Promise<boolean> {
        return this.element.isEnabled();
    }

    isPresent(): Promise<boolean> {
        return this.element.isExisting();
    }

    isSelected(): Promise<boolean> {
        return this.element.isSelected();
    }

    toString(): string {
        return this.element.toString(); // todo: or location?
    }
}
