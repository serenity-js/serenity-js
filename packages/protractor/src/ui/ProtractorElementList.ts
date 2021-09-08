import { LogicError } from '@serenity-js/core';
import { UIElement, UIElementList, UIElementLocation } from '@serenity-js/web';
import { ElementArrayFinder, ElementFinder, ProtractorBrowser } from 'protractor';

import { promiseOf } from '../promiseOf';
import { ProtractorElement } from './ProtractorElement';

export class ProtractorElementList implements UIElementList {
    constructor(
        private readonly browser: ProtractorBrowser,
        private readonly elements: ElementArrayFinder,
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

    private elementAt(index: number): ProtractorElement {
        if (! this.elements[index]) {
            throw new LogicError(`There's no item at index ${ index } within elements located ${ this.elementLocation } `);
        }

        return new ProtractorElement(this.browser, this.elements[index], this.elementLocation)
    }

    map<O>(fn: (element: UIElement, index?: number, elements?: UIElementList) => Promise<O> | O): Promise<O[]> {
        return promiseOf(
            this.elements.map((element?: ElementFinder, i?: number) =>
                fn(new ProtractorElement(this.browser, element, this.elementLocation), i, this)
            )
        );
    }

    filter(fn: (element: UIElement, index?: number) => boolean): ProtractorElementList {
        const matching = this.elements.filter(
            (element: ElementFinder, index: number) => fn(new ProtractorElement(this.browser, element, this.elementLocation), index)
        ) as ElementArrayFinder;

        // fixme: this is WDIO-specific; review
        // matching.selector   = this.elements.selector;
        // matching.parent     = this.elements.parent;
        // matching.foundWith  = this.elements.foundWith;
        // matching.props      = this.elements.props;

        return new ProtractorElementList(this.browser, matching, this.elementLocation);
    }

    forEach(fn: (element: UIElement, index?: number, elements?: UIElementList) => Promise<void> | void): Promise<void> {
        return promiseOf(this.elements.each((element: ElementFinder, index: number) => {
            return fn(new ProtractorElement(this.browser, element, this.elementLocation), index, this);
        }));
    }
}
