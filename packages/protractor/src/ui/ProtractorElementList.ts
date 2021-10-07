import { LogicError } from '@serenity-js/core';
import { Element, ElementList, ElementLocation } from '@serenity-js/web';
import { ElementArrayFinder, ElementFinder, ProtractorBrowser } from 'protractor';
import { ensure, isDefined } from 'tiny-types';

import { promiseOf } from '../promiseOf';
import { ProtractorElement } from './ProtractorElement';

export class ProtractorElementList implements ElementList {
    constructor(
        private readonly browser: ProtractorBrowser,
        private readonly elements: ElementArrayFinder,
        private readonly elementLocation: ElementLocation,
    ) {
        ensure('browser', browser, isDefined());
        ensure('elements', elements, isDefined());
        ensure('elementLocation', elementLocation, isDefined());
    }

    location(): ElementLocation {
        return this.elementLocation;
    }

    count(): Promise<number> {
        return promiseOf(this.elements.count());
    }

    first(): Element {
        return this.asElement(this.elements.first());
    }

    last(): Element {
        return this.asElement(this.elements.last());
    }

    get(index: number): Element {
        if (! this.elements.get(index)) {
            throw new LogicError(`There's no item at index ${ index } within elements located ${ this.elementLocation } `);
        }

        return this.asElement(this.elements.get(index));
    }

    map<O>(fn: (element: Element, index?: number, elements?: ElementList) => Promise<O> | O): Promise<O[]> {
        return promiseOf(
            this.elements.map((element?: ElementFinder, i?: number) =>
                fn(new ProtractorElement(this.browser, element, this.elementLocation), i, this)
            )
        );
    }

    filter(fn: (element: Element, index?: number) => boolean): ElementList {
        const matching = this.elements.filter(
            (element: ElementFinder, index: number) => fn(this.asElement(element), index)
        ) as ElementArrayFinder;

        // fixme: this is WDIO-specific; review
        // matching.selector   = this.elements.selector;
        // matching.parent     = this.elements.parent;
        // matching.foundWith  = this.elements.foundWith;
        // matching.props      = this.elements.props;

        return new ProtractorElementList(this.browser, matching, this.elementLocation);
    }

    forEach(fn: (element: Element, index?: number, elements?: ElementList) => Promise<void> | void): Promise<void> {
        return promiseOf(this.elements.each((element: ElementFinder, index: number) => {
            return fn(new ProtractorElement(this.browser, element, this.elementLocation), index, this);
        }));
    }

    private asElement(elementFinder: ElementFinder): Element {
        return new ProtractorElement(this.browser, elementFinder, this.elementLocation)
    }
}
