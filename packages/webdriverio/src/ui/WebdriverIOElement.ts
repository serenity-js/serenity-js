import { UIElement, UIElementList, UIElementLocation, UIElementLocator } from '@serenity-js/web';
import { Element, ElementArray } from 'webdriverio';

import { WebdriverIOElementList } from './WebdriverIOElementList';
import { WebdriverIOElementLocator } from './WebdriverIOElementLocator';

export class WebdriverIOElement implements UIElement {
    private readonly $:  UIElementLocator<Element<'async'>>;
    private readonly $$: UIElementLocator<ElementArray>;

    constructor(
        private readonly element: Element<'async'>,
        private readonly elementLocation: UIElementLocation,
    ) {
        this.$  = new WebdriverIOElementLocator(this.element.$.bind(this.element) as unknown as (selector: string) => Promise<Element<'async'>>);
        this.$$ = new WebdriverIOElementLocator(this.element.$$.bind(this.element));
    }

    nativeElement(): any {
        return this.element;
    }

    location(): UIElementLocation {
        return this.elementLocation;
    }

    locateChildElement(location: UIElementLocation): Promise<UIElement> {
        return this.$
            .locate(location)
            .then(element => new WebdriverIOElement(element, location));
    }

    locateAllChildElements(location: UIElementLocation): Promise<UIElementList> {
        return this.$$
            .locate(location)
            .then(elements => new WebdriverIOElementList(elements, location));
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

    isEnabled(): Promise<boolean> {
        return this.element.isEnabled();
    }

    isPresent(): Promise<boolean> {
        return this.element.isExisting();
    }

    isSelected(): Promise<boolean> {
        return this.element.isSelected();
    }

    isVisible(): Promise<boolean> {
        return this.element.isDisplayed();
    }

    toString(): string {
        return this.element.toString(); // todo: or location?
    }
}
