import { LogicError } from '@serenity-js/core';
import { PageElement, PageElements } from '@serenity-js/web';
import * as wdio from 'webdriverio';

import { WebdriverIONativeElementRoot } from './WebdriverIONativeElementRoot';
import { WebdriverIOPageElement } from './WebdriverIOPageElement';

export class WebdriverIOPageElements
    extends PageElements<WebdriverIONativeElementRoot, wdio.ElementArray, wdio.Element<'async'>>
{
    of(parent: PageElement<WebdriverIONativeElementRoot, wdio.Element<'async'>>): WebdriverIOPageElements {
        return new WebdriverIOPageElements(() => parent.nativeElement(), this.locator);
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

    async map<Mapped_Type>(fn: (element: PageElement, index?: number, elements?: PageElements) => Mapped_Type): Promise<Array<Awaited<Mapped_Type>>> {
        const elements = await this.nativeElementList();

        return Promise.all(
            elements.map((element, index) =>
                fn(new WebdriverIOPageElement(this.context, () => element), index, this)
            )
        );
    }

    filter(fn: (element: PageElement, index?: number) => Promise<boolean> | boolean): WebdriverIOPageElements {

        return new WebdriverIOPageElements(this.context, async context => {
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

    async forEach(fn: (element: PageElement, index?: number, elements?: PageElements) => Promise<void> | void): Promise<void> {
        const elements = await this.nativeElementList();

        return elements.reduce((previous: Promise<void>, element: wdio.Element<'async'>, index: number) => {
            return previous.then(() => fn(new WebdriverIOPageElement(this.context, () => element), index, this));
        }, Promise.resolve());
    }
}
