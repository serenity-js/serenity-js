import { LogicError } from '@serenity-js/core';
import { PageElement, PageElementList } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIONativeElementSearchContext } from './WebdriverIONativeElementSearchContext';
import { WebdriverIOPageElement } from './WebdriverIOPageElement';

export class WebdriverIOPageElementList
    extends PageElementList<WebdriverIONativeElementSearchContext, wdio.ElementArray, wdio.Element<'async'>>
{
    of(parent: PageElement<WebdriverIONativeElementSearchContext, wdio.Element<'async'>>): WebdriverIOPageElementList {
        return new WebdriverIOPageElementList(() => parent.nativeElement(), this.locator);
    }

    async count(): Promise<number> {
        const elements = await this.nativeElementList();
        return elements.length;
    }

    first(): Promise<WebdriverIOPageElement> {
        return this.elementAt(0);
    }

    async last(): Promise<WebdriverIOPageElement> {
        const elements = await this.nativeElementList();
        const index = elements.length - 1;

        return this.elementAt(index);
    }

    get(index: number): Promise<WebdriverIOPageElement> {
        return this.elementAt(index);
    }

    private async elementAt(index: number): Promise<WebdriverIOPageElement> {
        const elements = await this.nativeElementList();

        if (! elements[index]) {
            throw new LogicError(`There's no item at index ${ index }`);
        }

        return new WebdriverIOPageElement(this.context, () => elements[index])
    }

    async map<O>(fn: (element: PageElement, index?: number, elements?: PageElementList) => Promise<O> | O): Promise<O[]> {
        const elements = await this.nativeElementList();

        return Promise.all(
            elements.map((element, index) =>
                fn(new WebdriverIOPageElement(this.context, () => element), index, this)
            )
        );
    }

    filter(fn: (element: PageElement, index?: number) => Promise<boolean> | boolean): WebdriverIOPageElementList {

        return new WebdriverIOPageElementList(this.context, async context => {
            const elements = await this.locator(context);

            const matching = await Promise.all(
                elements.map(async (nativeElement: wdio.Element<'async'>, index: number) => {
                    const element = new WebdriverIOPageElement(this.context, () => nativeElement);
                    const matches = await fn(element, index);

                    return matches
                        ? nativeElement
                        : undefined;
                })
            );

            const results = matching.filter((element: wdio.Element<'async'> | undefined) => {
                return element !== undefined;
            }) as wdio.ElementArray;

            results.selector   = elements.selector;
            results.parent     = elements.parent;
            results.foundWith  = elements.foundWith;
            results.props      = elements.props;

            return results;
        });
    }

    async forEach(fn: (element: PageElement, index?: number, elements?: PageElementList) => Promise<void> | void): Promise<void> {
        const elements = await this.nativeElementList();

        return elements.reduce((previous: Promise<void>, element: wdio.Element<'async'>, index: number) => {
            return previous.then(() => fn(new WebdriverIOPageElement(this.context, () => element), index, this));
        }, Promise.resolve());
    }
}
