import { LogicError } from '@serenity-js/core';
import { Element, ElementList, ElementLocation } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIOElement } from './WebdriverIOElement';

export class WebdriverIOElementList implements ElementList {
    constructor(
        private readonly browser: wdio.Browser<'async'>,
        private readonly elements: wdio.ElementArray,
        private readonly elementLocation: ElementLocation,
    ) {
    }

    location(): ElementLocation {
        return this.elementLocation;
    }

    count(): Promise<number> {
        return Promise.resolve(this.elements.length);
    }

    first(): Element {
        return this.elementAt(0);
    }

    last(): Element {
        return this.elementAt(this.elements.length - 1);
    }

    get(index: number): Element {
        return this.elementAt(index);
    }

    private elementAt(index: number): WebdriverIOElement {
        if (! this.elements[index]) {
            throw new LogicError(`There's no item at index ${ index } within elements located ${ this.elementLocation } `);
        }

        return new WebdriverIOElement(this.browser, this.elements[index], this.elementLocation)
    }

    map<O>(fn: (element: Element, index?: number, elements?: ElementList) => Promise<O> | O): Promise<O[]> {
        return Promise.all(
            this.elements.map((element, index) =>
                // todo: is this.elementLocation reasonable? what does WDIO return in element.selector?
                fn(new WebdriverIOElement(this.browser, element, this.elementLocation), index, this)
            )
        );
    }

    filter(fn: (element: Element, index?: number) => boolean): WebdriverIOElementList {
        const matching = this.elements.filter(
            (element: wdio.Element<'async'>, index: number) => fn(new WebdriverIOElement(this.browser, element, this.elementLocation), index)
        ) as wdio.ElementArray;

        matching.selector   = this.elements.selector;
        matching.parent     = this.elements.parent;
        matching.foundWith  = this.elements.foundWith;
        matching.props      = this.elements.props;

        return new WebdriverIOElementList(this.browser, matching, this.elementLocation);
    }

    forEach(fn: (element: Element, index?: number, elements?: ElementList) => Promise<void> | void): Promise<void> {
        return this.elements.reduce((previous: Promise<void>, element: wdio.Element<'async'>, index: number) => {
            return previous.then(() => fn(new WebdriverIOElement(this.browser, element, this.elementLocation), index, this));
        }, Promise.resolve());
    }
}
