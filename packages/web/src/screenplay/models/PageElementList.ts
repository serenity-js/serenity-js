import { Adapter, Answerable, LogicError, Question } from '@serenity-js/core';
import { formatted } from '@serenity-js/core/lib/io';

import { BrowseTheWeb } from '../abilities';
import { PageElement } from './PageElement';

// todo: rename to PageElements
export abstract class PageElementList<NativeElementContext = any, NativeElementList = any, NativeElement = any>
// todo: implements List (Attribute.spec.ts)
{
    static of(childElements: Answerable<PageElementList>, parentElement: Answerable<PageElement>): Question<Promise<PageElementList>> & Adapter<PageElementList> {
        return Question.about<Promise<PageElementList>>(formatted `${ childElements } of ${ parentElement })`, async actor => {
            const children  = await actor.answer(childElements);
            const parent    = await actor.answer(parentElement);

            return children.of(parent);
        });
    }

    static locatedByCss(selector: Answerable<string>): Question<Promise<PageElementList>> & Adapter<PageElementList> {
        return Question.about<Promise<PageElementList>>(formatted `page element list located by css (${selector})`, async actor => {
            const value = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByCss(value);
        });
    }

    static locatedByTagName(selector: Answerable<string>): Question<Promise<PageElementList>> & Adapter<PageElementList> {
        return Question.about<Promise<PageElementList>>(formatted `page element list located by tag name (${selector})`, async actor => {
            const tagNameSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByTagName(tagNameSelector);
        });
    }

    static locatedByXPath(selector: Answerable<string>): Question<Promise<PageElementList>> & Adapter<PageElementList> {
        return Question.about<Promise<PageElementList>>(formatted `page element list located by xpath (${selector})`, async actor => {
            const xpathSelector = await actor.answer(selector);
            return BrowseTheWeb.as(actor).findAllByXPath(xpathSelector);
        });
    }

    constructor(
        protected readonly context: () => Promise<NativeElementContext> | NativeElementContext,
        protected readonly locator: (root: NativeElementContext) => Promise<NativeElementList> | NativeElementList
    ) {
    }

    abstract of(parent: PageElement): PageElementList;

    async nativeElementList(): Promise<NativeElementList> {
        try {
            const context = await this.context();
            return this.locator(context);
        }
        catch (error) {
            throw new LogicError(`Couldn't find elements`, error);
        }
    }

    abstract count(): Promise<number>;
    abstract first(): Promise<PageElement<NativeElementContext, NativeElement>>;
    abstract last(): Promise<PageElement<NativeElementContext, NativeElement>>;
    abstract get(index: number): Promise<PageElement<NativeElementContext, NativeElement>>;

    abstract map<O>(fn: (element: PageElement, index?: number, elements?: PageElementList) => Promise<O> | O): Promise<O[]>;

    abstract filter(fn: (element: PageElement, index?: number) => Promise<boolean> | boolean): PageElementList;

    abstract forEach(fn: (element: PageElement, index?: number) => Promise<void> | void): Promise<void>;
}
