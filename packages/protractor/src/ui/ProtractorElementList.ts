import { LogicError } from '@serenity-js/core';
import { UIElement, UIElementList, UIElementLocation } from '@serenity-js/web';
import { ElementArrayFinder, ElementFinder, ProtractorBrowser } from 'protractor';
import { ensure, isDefined } from 'tiny-types';

import { promiseOf } from '../promiseOf';
import { ProtractorElement } from './ProtractorElement';

export class ProtractorElementList implements UIElementList {
    constructor(
        private readonly browser: ProtractorBrowser,
        private readonly elements: ElementArrayFinder,
        private readonly elementLocation: UIElementLocation,
    ) {
        ensure('browser', browser, isDefined());
        ensure('elements', elements, isDefined());
        ensure('elementLocation', elementLocation, isDefined());
    }

    location(): UIElementLocation {
        return this.elementLocation;
    }

    count(): Promise<number> {
        return promiseOf(this.elements.count());
    }

    first(): UIElement {
        return this.asUIElement(this.elements.first());
    }

    last(): UIElement {
        return this.asUIElement(this.elements.last());
    }

    get(index: number): UIElement {
        if (! this.elements.get(index)) {
            throw new LogicError(`There's no item at index ${ index } within elements located ${ this.elementLocation } `);
        }

        return this.asUIElement(this.elements.get(index));
    }

    map<O>(fn: (element: UIElement, index?: number, elements?: UIElementList) => Promise<O> | O): Promise<O[]> {
        return promiseOf(
            this.elements.map((element?: ElementFinder, i?: number) =>
                fn(new ProtractorElement(this.browser, element, this.elementLocation), i, this)
            )
        );
    }

    filter(fn: (element: UIElement, index?: number) => boolean): UIElementList {
        const matching = this.elements.filter(
            (element: ElementFinder, index: number) => fn(this.asUIElement(element), index)
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

    private asUIElement(elementFinder: ElementFinder): UIElement {
        return new ProtractorElement(this.browser, elementFinder, this.elementLocation)
    }
}
