import { LogicError } from '@serenity-js/core';
import { PageElement, PageElements } from '@serenity-js/web';
import { ElementArrayFinder, ElementFinder } from 'protractor';

import { promisedWebElement } from '../promisedWebElement';
import { ProtractorNativeElementRoot } from './ProtractorNativeElementRoot';
import { ProtractorPageElement } from './ProtractorPageElement';

export class ProtractorPageElements
    extends PageElements<ProtractorNativeElementRoot, ElementArrayFinder, ElementFinder>
{
    constructor(
        context: () => Promise<ProtractorNativeElementRoot> | ProtractorNativeElementRoot,
        locator: (root: ProtractorNativeElementRoot) => Promise<ElementArrayFinder> | ElementArrayFinder
    ) {
        super(context, async (context: ProtractorNativeElementRoot): Promise<ElementArrayFinder> => {
            return promisedWebElement<ElementArrayFinder>(locator(context));
        });
    }

    of(parent: PageElement<ProtractorNativeElementRoot, ElementFinder>): ProtractorPageElements {
        return new ProtractorPageElements(() => parent.nativeElement(), this.locator);
    }

    async count(): Promise<number> {
        const elements = await this.nativeElementList() as unknown as ElementArrayFinder;
        return elements.count();
    }

    async first(): Promise<ProtractorPageElement> {
        const elements = await this.nativeElementList() as unknown as ElementArrayFinder;
        return this.asElement(elements.first());
    }

    async last(): Promise<ProtractorPageElement> {
        const elements = await this.nativeElementList() as unknown as ElementArrayFinder;
        return this.asElement(elements.last());
    }

    async get(index: number): Promise<ProtractorPageElement> {
        const elements = await this.nativeElementList() as unknown as ElementArrayFinder;

        if (! elements.get(index)) {
            throw new LogicError(`There's no item at index ${ index }`);
        }

        return this.asElement(elements.get(index));
    }

    async map<Mapped_Type>(fn: (element: PageElement, index?: number, elements?: PageElements) => Mapped_Type): Promise<Array<Awaited<Mapped_Type>>> {
        const elements = await this.nativeElementList() as unknown as ElementArrayFinder;

        return elements.map((element?: ElementFinder, i?: number) =>
            fn(new ProtractorPageElement(this.context, _context => element), i, this)
        );
    }

    filter(fn: (element: PageElement, index?: number) => Promise<boolean> | boolean): PageElements {
        return new ProtractorPageElements(
            this.context,
            async (context: ProtractorNativeElementRoot): Promise<ElementArrayFinder> => {
                const elements = await this.locator(context) as unknown as ElementArrayFinder;

                const result = elements.filter(async (nativeElement: ElementFinder, index: number) => {
                    const element = new ProtractorPageElement(this.context, _context => nativeElement);
                    const result = await fn(element, index);
                    return result;
                });

                return promisedWebElement<ElementArrayFinder>(result);
            }
        );
    }

    async forEach(fn: (element: PageElement, index?: number, elements?: PageElements) => Promise<void> | void): Promise<void> {
        const elements = await this.nativeElementList() as unknown as ElementArrayFinder

        return elements.each((element: ElementFinder, index: number) => {
            return fn(new ProtractorPageElement(this.context, _context => element), index, this);
        });
    }

    private asElement(elementFinder: ElementFinder): PageElement {
        return new ProtractorPageElement(this.context, _context => elementFinder);
    }
}
