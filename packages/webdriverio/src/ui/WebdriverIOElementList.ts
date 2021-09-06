import { LogicError } from '@serenity-js/core';
import { UIElement, UIElementList, UIElementLocation } from '@serenity-js/web';
import { Element, ElementArray } from 'webdriverio';

import { WebdriverIOElement } from './WebdriverIOElement';

export class WebdriverIOElementList implements UIElementList {
    constructor(
        private readonly elements: ElementArray,
        private readonly elementLocation: UIElementLocation,
    ) {
    }

    location(): UIElementLocation {
        return this.elementLocation;
    }

    count(): number {
        return this.elements.length;
    }

    first(): UIElement {
        return this.elementAt(0);
    }

    last(): UIElement {
        return this.elementAt(this.elements.length - 1);
    }

    get(index: number): UIElement {
        return this.elementAt(index);
    }

    private elementAt(index: number): WebdriverIOElement {
        if (! this.elements[index]) {
            console.error('WebdriverIOElementList', this.elements);
            throw new LogicError(`There's no item at index ${ index } within elements located ${ this.elementLocation } `);
        }

        return new WebdriverIOElement(this.elements[index], this.elementLocation)
    }

    map<O>(fn: (element: UIElement, index?: number, elements?: UIElementList) => Promise<O> | O): Promise<O[]> {
        return Promise.all(
            this.elements.map((element, i) =>
                // todo: is this.elementLocation valid? what does WDIO return in element.selector?
                fn(new WebdriverIOElement(element, this.elementLocation), i, this)
            )
        );
    }

    filter(fn: (element: UIElement, index?: number) => boolean): WebdriverIOElementList {
        const matching = this.elements.filter(
            (element: Element<'async'>, index: number) => fn(new WebdriverIOElement(element, this.elementLocation), index)
        ) as ElementArray;

        matching.selector   = this.elements.selector;
        matching.parent     = this.elements.parent;
        matching.foundWith  = this.elements.foundWith;
        matching.props      = this.elements.props;

        return new WebdriverIOElementList(matching, this.elementLocation);
    }
}
